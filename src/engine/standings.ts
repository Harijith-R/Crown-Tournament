import type {
  CategoryConfig,
  CategoryId,
  CategoryStatistics,
  DoublesPair,
  FixtureMatch,
  GroupId,
  KnockoutRoundName,
  KnockoutSlot,
  MatchResult,
  MatchStatus,
  OfficialCourt,
  StandingRow,
} from '../types/tournament';
import { SCHEDULE_CAPACITY_CONFIG, STAGE_SCORING_CONFIG } from '../data/tournament';

export function isCompletedMatchStatus(status: MatchStatus): boolean {
  return status === 'Played' || status === 'Walkover';
}

export function sortFixturesChronologically(fixtures: FixtureMatch[]): FixtureMatch[] {
  return [...fixtures].sort((a, b) => {
    const dateCompare = a.isoDate.localeCompare(b.isoDate);
    if (dateCompare !== 0) return dateCompare;
    return a.scheduleOrder - b.scheduleOrder;
  });
}

export function getTargetPointsForStage(
  stage: 'group' | 'knockout',
  knockoutRound?: KnockoutRoundName
): number {
  if (stage === 'group') {
    return STAGE_SCORING_CONFIG.groupStagePoints;
  }
  if (knockoutRound === 'Final') {
    return STAGE_SCORING_CONFIG.finalsPoints;
  }
  return STAGE_SCORING_CONFIG.knockoutStagePoints;
}

export function isOfficialMatchCourt(court: string): court is OfficialCourt {
  return (SCHEDULE_CAPACITY_CONFIG.officialMatchCourts as readonly string[]).includes(court);
}

export function determineMatchWinner(
  fixture: FixtureMatch,
  result: MatchResult | undefined
): string | null {
  if (!result || !isCompletedMatchStatus(fixture.status)) return null;
  if (result.pair1Score === result.pair2Score) return result.winnerPairId || null;
  return result.pair1Score > result.pair2Score ? fixture.pair1Id : fixture.pair2Id;
}

export function calculateMatchStatistics(
  fixtures: FixtureMatch[],
  results: MatchResult[]
): CategoryStatistics {
  const resultMap = new Map(results.map((r) => [r.fixtureId, r]));
  let completedMatches = 0;
  let toBePlayedMatches = 0;
  let postponedMatches = 0;
  let totalPointsScored = 0;
  let highestMatchTotal = 0;

  for (const fixture of fixtures) {
    if (isCompletedMatchStatus(fixture.status)) {
      completedMatches++;
      const res = resultMap.get(fixture.id);
      if (res) {
        const matchTotal = res.pair1Score + res.pair2Score;
        totalPointsScored += matchTotal;
        if (matchTotal > highestMatchTotal) highestMatchTotal = matchTotal;
      }
    } else if (fixture.status === 'Postponed') {
      postponedMatches++;
    } else if (fixture.status === 'To Be Played' || fixture.status === 'Rescheduled') {
      toBePlayedMatches++;
    }
  }

  return {
    totalMatches: fixtures.length,
    completedMatches,
    toBePlayedMatches,
    postponedMatches,
    totalPointsScored,
    highestMatchTotal,
  };
}

interface InternalStats {
  pair: DoublesPair;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  difference: number;
  tablePoints: number;
}

/**
 * Calculates full round-robin standings for a single group.
 * Ranking order:
 * 1. Table Points (Win = 2, Loss = 0)
 * 2. Tie-breaker: Total Points Scored ONLY
 * Strictly ignores To Be Played, Postponed, Rescheduled, and Cancelled fixtures.
 */
export function calculateGroupStandings(
  categoryId: CategoryId,
  groupId: GroupId,
  pairs: DoublesPair[],
  fixtures: FixtureMatch[],
  results: MatchResult[],
  qualifiersCount = 2
): StandingRow[] {
  const groupPairs = pairs.filter(
    (p) => p.categoryId === categoryId && p.groupId === groupId
  );

  if (groupPairs.length === 0) return [];

  const groupFixtures = fixtures.filter(
    (f) => f.categoryId === categoryId && f.groupId === groupId && f.stage === 'group'
  );
  const resultMap = new Map(results.map((r) => [r.fixtureId, r]));

  const statsMap = new Map<string, InternalStats>();
  for (const pair of groupPairs) {
    statsMap.set(pair.id, {
      pair,
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      difference: 0,
      tablePoints: 0,
    });
  }

  for (const fixture of groupFixtures) {
    if (!isCompletedMatchStatus(fixture.status)) continue;
    const result = resultMap.get(fixture.id);
    if (!result) continue;

    const s1 = statsMap.get(fixture.pair1Id);
    const s2 = statsMap.get(fixture.pair2Id);
    if (!s1 || !s2) continue;

    s1.played += 1;
    s2.played += 1;
    s1.pointsFor += result.pair1Score;
    s1.pointsAgainst += result.pair2Score;
    s2.pointsFor += result.pair2Score;
    s2.pointsAgainst += result.pair1Score;

    if (result.pair1Score > result.pair2Score) {
      s1.won += 1;
      s1.tablePoints += STAGE_SCORING_CONFIG.winTablePoints;
      s2.lost += 1;
      s2.tablePoints += STAGE_SCORING_CONFIG.lossTablePoints;
    } else if (result.pair2Score > result.pair1Score) {
      s2.won += 1;
      s2.tablePoints += STAGE_SCORING_CONFIG.winTablePoints;
      s1.lost += 1;
      s1.tablePoints += STAGE_SCORING_CONFIG.lossTablePoints;
    }
  }

  const allStats = Array.from(statsMap.values()).map((s) => ({
    ...s,
    difference: s.pointsFor - s.pointsAgainst,
  }));

  // Group by tablePoints first to resolve ties strictly by Total Points Scored
  const pointsBuckets = new Map<number, InternalStats[]>();
  for (const row of allStats) {
    const bucket = pointsBuckets.get(row.tablePoints) ?? [];
    bucket.push(row);
    pointsBuckets.set(row.tablePoints, bucket);
  }

  const sortedPointsKeys = Array.from(pointsBuckets.keys()).sort((a, b) => b - a);
  const ordered: Array<InternalStats & { tieBreakerApplied: StandingRow['tieBreakerApplied'] }> = [];

  for (const pts of sortedPointsKeys) {
    const bucket = pointsBuckets.get(pts)!;
    if (bucket.length === 1) {
      ordered.push({ ...bucket[0], tieBreakerApplied: null });
      continue;
    }

    const sortedBucket = [...bucket].sort((a, b) => {
      // Sole Tie-breaker: Total Points Scored
      if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
      return a.pair.seedPosition - b.pair.seedPosition;
    });

    sortedBucket.forEach((entry) => {
      const hasPlayedMatches = entry.played > 0;
      const separatedByTotalPoints =
        hasPlayedMatches &&
        sortedBucket.some(
          (peer) => peer.pair.id !== entry.pair.id && peer.pointsFor !== entry.pointsFor
        );
      ordered.push({
        ...entry,
        tieBreakerApplied: separatedByTotalPoints ? 'total-points' : null,
      });
    });
  }

  return ordered.map((row, index) => ({
    position: index + 1,
    pairId: row.pair.id,
    pairCode: row.pair.pairCode,
    pairName: row.pair.displayName,
    played: row.played,
    won: row.won,
    lost: row.lost,
    pointsFor: row.pointsFor,
    pointsAgainst: row.pointsAgainst,
    difference: row.difference,
    tablePoints: row.tablePoints,
    qualified: row.played > 0 && index < qualifiersCount,
    tieBreakerApplied: row.tieBreakerApplied,
  }));
}

export function identifyQualifyingPairs(
  standings: StandingRow[],
  qualifiersPerGroup = 2
): StandingRow[] {
  return standings.slice(0, qualifiersPerGroup);
}

/**
 * Generates Knockout Bracket structure from category rules without inventing dates, times,
 * courts, or knockout opponents until group qualification and draw details are confirmed.
 * - Blue / Yellow: Semifinals -> Final (30 points)
 * - Orange: Quarter-finals -> Semifinals -> Final (30 points)
 */
export function generateKnockoutParticipants(
  category: CategoryConfig,
  pairs: DoublesPair[],
  fixtures: FixtureMatch[],
  results: MatchResult[]
): Record<string, KnockoutSlot[]> {
  const standingsByGroup: Partial<Record<GroupId, StandingRow[]>> = {};
  const hasAnyCompletedResults = fixtures.some(
    (f) => f.categoryId === category.id && isCompletedMatchStatus(f.status)
  );

  if (hasAnyCompletedResults) {
    for (const g of category.groups) {
      standingsByGroup[g] = calculateGroupStandings(
        category.id,
        g,
        pairs,
        fixtures,
        results,
        category.qualifiersPerGroup
      );
    }
  }

  const getSeedDisplay = (groupId: GroupId, posIndex: number): string => {
    const table = standingsByGroup[groupId];
    if (!hasAnyCompletedResults || !table || !table[posIndex]) {
      return `Group ${groupId} #${posIndex + 1}`;
    }
    return `${table[posIndex].pairName} (${groupId}${posIndex + 1})`;
  };

  if (category.id === 'orange') {
    const qf: KnockoutSlot[] = [
      {
        id: 'or-qf-1',
        round: 'Quarter-finals',
        matchLabel: 'QF 1',
        pair1Label: 'Group A Winner',
        pair2Label: 'Group B Runner-up',
        pair1Name: getSeedDisplay('A', 0),
        pair2Name: getSeedDisplay('B', 1),
        status: 'To Be Played',
      },
      {
        id: 'or-qf-2',
        round: 'Quarter-finals',
        matchLabel: 'QF 2',
        pair1Label: 'Group C Winner',
        pair2Label: 'Group D Runner-up',
        pair1Name: getSeedDisplay('C', 0),
        pair2Name: getSeedDisplay('D', 1),
        status: 'To Be Played',
      },
      {
        id: 'or-qf-3',
        round: 'Quarter-finals',
        matchLabel: 'QF 3',
        pair1Label: 'Group B Winner',
        pair2Label: 'Group A Runner-up',
        pair1Name: getSeedDisplay('B', 0),
        pair2Name: getSeedDisplay('A', 1),
        status: 'To Be Played',
      },
      {
        id: 'or-qf-4',
        round: 'Quarter-finals',
        matchLabel: 'QF 4',
        pair1Label: 'Group D Winner',
        pair2Label: 'Group C Runner-up',
        pair1Name: getSeedDisplay('D', 0),
        pair2Name: getSeedDisplay('C', 1),
        status: 'To Be Played',
      },
    ];

    const sf: KnockoutSlot[] = [
      {
        id: 'or-sf-1',
        round: 'Semifinals',
        matchLabel: 'SF 1',
        pair1Label: 'Winner QF 1',
        pair2Label: 'Winner QF 2',
        pair1Name: 'Winner QF 1',
        pair2Name: 'Winner QF 2',
        status: 'To Be Played',
      },
      {
        id: 'or-sf-2',
        round: 'Semifinals',
        matchLabel: 'SF 2',
        pair1Label: 'Winner QF 3',
        pair2Label: 'Winner QF 4',
        pair1Name: 'Winner QF 3',
        pair2Name: 'Winner QF 4',
        status: 'To Be Played',
      },
    ];

    const finalRound: KnockoutSlot[] = [
      {
        id: 'or-final',
        round: 'Final',
        matchLabel: 'ORANGE FINAL',
        pair1Label: 'Winner SF 1',
        pair2Label: 'Winner SF 2',
        pair1Name: 'Winner SF 1',
        pair2Name: 'Winner SF 2',
        status: 'To Be Played',
        date: '13-Dec-2026',
      },
    ];

    return {
      'Quarter-finals': qf,
      Semifinals: sf,
      Final: finalRound,
    };
  }

  // Blue and Yellow (2 groups -> Semifinals -> Final)
  const sf: KnockoutSlot[] = [
    {
      id: `${category.id}-sf-1`,
      round: 'Semifinals',
      matchLabel: 'SF 1',
      pair1Label: 'Group A Winner',
      pair2Label: 'Group B Runner-up',
      pair1Name: getSeedDisplay('A', 0),
      pair2Name: getSeedDisplay('B', 1),
      status: 'To Be Played',
    },
    {
      id: `${category.id}-sf-2`,
      round: 'Semifinals',
      matchLabel: 'SF 2',
      pair1Label: 'Group B Winner',
      pair2Label: 'Group A Runner-up',
      pair1Name: getSeedDisplay('B', 0),
      pair2Name: getSeedDisplay('A', 1),
      status: 'To Be Played',
    },
  ];

  const finalRound: KnockoutSlot[] = [
    {
      id: `${category.id}-final`,
      round: 'Final',
      matchLabel: `${category.name} FINAL`,
      pair1Label: 'Winner SF 1',
      pair2Label: 'Winner SF 2',
      pair1Name: 'Winner SF 1',
      pair2Name: 'Winner SF 2',
      status: 'To Be Played',
      date: '13-Dec-2026',
    },
  ];

  return {
    Semifinals: sf,
    Final: finalRound,
  };
}

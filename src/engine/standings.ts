import type {
  CategoryConfig,
  CategoryId,
  CategoryStatistics,
  DoublesPair,
  FixtureMatch,
  GroupId,
  KnockoutSlot,
  MatchResult,
  StandingRow,
} from '../types/tournament';

export function determineMatchWinner(
  fixture: FixtureMatch,
  result: MatchResult | undefined
): string | null {
  if (!result || fixture.status !== 'completed') return null;
  if (result.pair1Score === result.pair2Score) return result.winnerPairId || null;
  return result.pair1Score > result.pair2Score ? fixture.pair1Id : fixture.pair2Id;
}

export function calculateMatchStatistics(
  fixtures: FixtureMatch[],
  results: MatchResult[]
): CategoryStatistics {
  const resultMap = new Map(results.map((r) => [r.fixtureId, r]));
  let completedMatches = 0;
  let liveMatches = 0;
  let upcomingMatches = 0;
  let postponedMatches = 0;
  let totalPointsScored = 0;
  let highestMatchTotal = 0;

  for (const fixture of fixtures) {
    if (fixture.status === 'completed') {
      completedMatches++;
      const res = resultMap.get(fixture.id);
      if (res) {
        const matchTotal = res.pair1Score + res.pair2Score;
        totalPointsScored += matchTotal;
        if (matchTotal > highestMatchTotal) highestMatchTotal = matchTotal;
      }
    } else if (fixture.status === 'live') {
      liveMatches++;
    } else if (fixture.status === 'postponed') {
      postponedMatches++;
    } else {
      upcomingMatches++;
    }
  }

  return {
    totalMatches: fixtures.length,
    completedMatches,
    liveMatches,
    upcomingMatches,
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
 * Computes head-to-head mini-standings exclusively among a subset of tied pairs.
 */
function getHeadToHeadMetrics(
  tiedPairIds: Set<string>,
  groupFixtures: FixtureMatch[],
  resultMap: Map<string, MatchResult>
): Map<string, { points: number; diff: number; pf: number }> {
  const h2h = new Map<string, { points: number; diff: number; pf: number }>();
  tiedPairIds.forEach((id) => h2h.set(id, { points: 0, diff: 0, pf: 0 }));

  for (const fix of groupFixtures) {
    if (fix.status !== 'completed') continue;
    if (!tiedPairIds.has(fix.pair1Id) || !tiedPairIds.has(fix.pair2Id)) continue;

    const res = resultMap.get(fix.id);
    if (!res) continue;

    const s1 = h2h.get(fix.pair1Id)!;
    const s2 = h2h.get(fix.pair2Id)!;

    s1.pf += res.pair1Score;
    s1.diff += res.pair1Score - res.pair2Score;
    s2.pf += res.pair2Score;
    s2.diff += res.pair2Score - res.pair1Score;

    if (res.pair1Score > res.pair2Score) {
      s1.points += 2;
    } else if (res.pair2Score > res.pair1Score) {
      s2.points += 2;
    }
  }

  return h2h;
}

/**
 * Calculates full round-robin standings for a single group and applies tie-breakers:
 * 1. Head-to-head (mini-league points, then H2H point diff, then H2H points for)
 * 2. Overall Point Difference
 * 3. Overall Total Points Scored
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
    if (fixture.status !== 'completed') continue;
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
      s1.tablePoints += 2;
      s2.lost += 1;
    } else if (result.pair2Score > result.pair1Score) {
      s2.won += 1;
      s2.tablePoints += 2;
      s1.lost += 1;
    }
  }

  const allStats = Array.from(statsMap.values()).map((s) => ({
    ...s,
    difference: s.pointsFor - s.pointsAgainst,
  }));

  // Group by tablePoints first to resolve ties accurately within each points bucket
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

    const tiedIds = new Set(bucket.map((b) => b.pair.id));
    const h2h = getHeadToHeadMetrics(tiedIds, groupFixtures, resultMap);

    const sortedBucket = [...bucket].sort((a, b) => {
      const ha = h2h.get(a.pair.id)!;
      const hb = h2h.get(b.pair.id)!;

      // 1. Head-to-head
      if (hb.points !== ha.points) return hb.points - ha.points;
      if (hb.diff !== ha.diff) return hb.diff - ha.diff;
      if (hb.pf !== ha.pf) return hb.pf - ha.pf;

      // 2. Overall Point Difference
      if (b.difference !== a.difference) return b.difference - a.difference;

      // 3. Total Points Scored
      if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;

      return a.pair.seedPosition - b.pair.seedPosition;
    });

    sortedBucket.forEach((entry, idx) => {
      let reason: StandingRow['tieBreakerApplied'] = null;
      const peer = sortedBucket[idx === 0 ? 1 : idx - 1];
      if (peer) {
        const ha = h2h.get(entry.pair.id)!;
        const hb = h2h.get(peer.pair.id)!;
        if (ha.points !== hb.points || ha.diff !== hb.diff || ha.pf !== hb.pf) {
          reason = 'head-to-head';
        } else if (entry.difference !== peer.difference) {
          reason = 'point-difference';
        } else if (entry.pointsFor !== peer.pointsFor) {
          reason = 'total-points';
        }
      }
      ordered.push({ ...entry, tieBreakerApplied: reason });
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
 * Generates responsive Knockout Bracket rounds from group standings & rules:
 * - Blue / Yellow: Semifinals (A1 vs B2, B1 vs A2) -> Final
 * - Orange: Quarter-finals (A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2) -> Semifinals -> Final
 */
export function generateKnockoutParticipants(
  category: CategoryConfig,
  pairs: DoublesPair[],
  fixtures: FixtureMatch[],
  results: MatchResult[],
  hasData: boolean
): Record<string, KnockoutSlot[]> {
  const standingsByGroup: Partial<Record<GroupId, StandingRow[]>> = {};

  if (hasData) {
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
    if (!hasData || !table || !table[posIndex]) {
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
        status: 'upcoming',
        date: '11 Dec 2026',
        time: '18:00',
        court: 'Court 1',
      },
      {
        id: 'or-qf-2',
        round: 'Quarter-finals',
        matchLabel: 'QF 2',
        pair1Label: 'Group C Winner',
        pair2Label: 'Group D Runner-up',
        pair1Name: getSeedDisplay('C', 0),
        pair2Name: getSeedDisplay('D', 1),
        status: 'upcoming',
        date: '11 Dec 2026',
        time: '18:45',
        court: 'Court 2',
      },
      {
        id: 'or-qf-3',
        round: 'Quarter-finals',
        matchLabel: 'QF 3',
        pair1Label: 'Group B Winner',
        pair2Label: 'Group A Runner-up',
        pair1Name: getSeedDisplay('B', 0),
        pair2Name: getSeedDisplay('A', 1),
        status: 'upcoming',
        date: '11 Dec 2026',
        time: '19:30',
        court: 'Court 1',
      },
      {
        id: 'or-qf-4',
        round: 'Quarter-finals',
        matchLabel: 'QF 4',
        pair1Label: 'Group D Winner',
        pair2Label: 'Group C Runner-up',
        pair1Name: getSeedDisplay('D', 0),
        pair2Name: getSeedDisplay('C', 1),
        status: 'upcoming',
        date: '11 Dec 2026',
        time: '20:15',
        court: 'Court 2',
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
        status: 'upcoming',
        date: '12 Dec 2026',
        time: '18:30',
        court: 'Court 1',
      },
      {
        id: 'or-sf-2',
        round: 'Semifinals',
        matchLabel: 'SF 2',
        pair1Label: 'Winner QF 3',
        pair2Label: 'Winner QF 4',
        pair1Name: 'Winner QF 3',
        pair2Name: 'Winner QF 4',
        status: 'upcoming',
        date: '12 Dec 2026',
        time: '19:30',
        court: 'Court 1',
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
        status: 'upcoming',
        date: '13 Dec 2026',
        time: '20:00',
        court: 'Centre Court',
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
      status: 'upcoming',
      date: '11 Dec 2026',
      time: category.id === 'blue' ? '18:00' : '19:00',
      court: 'Court 1',
    },
    {
      id: `${category.id}-sf-2`,
      round: 'Semifinals',
      matchLabel: 'SF 2',
      pair1Label: 'Group B Winner',
      pair2Label: 'Group A Runner-up',
      pair1Name: getSeedDisplay('B', 0),
      pair2Name: getSeedDisplay('A', 1),
      status: 'upcoming',
      date: '11 Dec 2026',
      time: category.id === 'blue' ? '18:45' : '19:45',
      court: 'Court 2',
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
      status: 'upcoming',
      date: '13 Dec 2026',
      time: category.id === 'blue' ? '18:30' : '19:15',
      court: 'Centre Court',
    },
  ];

  return {
    Semifinals: sf,
    Final: finalRound,
  };
}

import type { CategoryId, FixtureMatch, GroupId, MatchStatus } from '../types/tournament';
import { DEMO_GROUPS } from './groups';

/**
 * Official fixtures remain empty until the 18 November 2026 draw & schedule release.
 */
export const OFFICIAL_FIXTURES: FixtureMatch[] = [];

const MATCH_DATES = [
  '28 Nov 2026',
  '29 Nov 2026',
  '30 Nov 2026',
  '02 Dec 2026',
  '04 Dec 2026',
  '06 Dec 2026',
  '08 Dec 2026',
  '10 Dec 2026',
];

const MATCH_TIMES = ['18:00', '18:45', '19:30', '20:15', '21:00'];
const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5'];

/**
 * Generates deterministic demonstration round-robin fixtures across all 8 groups
 * so visitors can test filtering, standings, tie-breakers, and knockout seeding.
 */
function buildDemoFixtures(): FixtureMatch[] {
  const fixtures: FixtureMatch[] = [];
  let globalCounter = 1;

  const prefixMap: Record<CategoryId, string> = {
    blue: 'BL',
    orange: 'OR',
    yellow: 'YL',
  };

  for (const group of DEMO_GROUPS) {
    const pairIds = group.pairIds;
    const roundPairs: Array<[string, string]> = [];

    for (let i = 0; i < pairIds.length; i++) {
      for (let j = i + 1; j < pairIds.length; j++) {
        roundPairs.push([pairIds[i], pairIds[j]]);
      }
    }

    roundPairs.forEach(([pair1Id, pair2Id], idx) => {
      let status: MatchStatus = 'completed';

      // Blue Group A: all 6 matches completed to showcase full final group table + tie-breaker
      // Blue Group B: 4 completed, 1 live, 1 upcoming
      if (group.categoryId === 'blue' && group.groupId === 'B') {
        if (idx === 4) status = 'live';
        else if (idx === 5) status = 'upcoming';
      }

      // Orange groups: mix of completed, live, upcoming, and 1 postponed
      if (group.categoryId === 'orange') {
        if (group.groupId === 'A' && idx >= 7) {
          status = idx === 7 ? 'live' : idx === 8 ? 'postponed' : 'upcoming';
        } else if (group.groupId === 'B' && idx >= 6) {
          status = idx === 6 ? 'live' : 'upcoming';
        } else if ((group.groupId === 'C' || group.groupId === 'D') && idx >= 4) {
          status = idx === 4 ? 'upcoming' : 'postponed';
        }
      }

      // Yellow groups: mix of completed, live, upcoming
      if (group.categoryId === 'yellow') {
        if (group.groupId === 'A' && idx >= 7) {
          status = idx === 7 ? 'live' : 'upcoming';
        } else if (group.groupId === 'B' && idx >= 6) {
          status = idx === 6 ? 'postponed' : 'upcoming';
        }
      }

      const matchCode = `${prefixMap[group.categoryId]}-${group.groupId}${String(idx + 1).padStart(2, '0')}`;

      fixtures.push({
        id: `demo-fix-${group.categoryId}-${group.groupId}-${idx + 1}`,
        matchNumber: matchCode,
        categoryId: group.categoryId,
        groupId: group.groupId as GroupId,
        stage: 'group',
        pair1Id,
        pair2Id,
        date: MATCH_DATES[(globalCounter + idx) % MATCH_DATES.length],
        time: MATCH_TIMES[(globalCounter + idx) % MATCH_TIMES.length],
        court: COURTS[(globalCounter + idx) % COURTS.length],
        status,
        isDemo: true,
      });

      globalCounter++;
    });
  }

  return fixtures;
}

export const DEMO_FIXTURES: FixtureMatch[] = buildDemoFixtures();

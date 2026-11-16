import type { MatchResult } from '../types/tournament';
import { DEMO_FIXTURES } from './fixtures';

/**
 * Official results remain empty until tournament play begins on 28 November 2026.
 */
export const OFFICIAL_RESULTS: MatchResult[] = [];

/**
 * Hand-tuned scores for Blue Group A to explicitly exercise:
 * - Tie on Table Points (Pair 1 & Pair 2 both at 4 pts) resolved by Head-to-Head!
 * - Realistic 30-point single-game rally scoring.
 */
const BLUE_A_OVERRIDES: Record<string, [number, number]> = {
  // idx 0: A1 vs A2 -> A2 wins 30-26 (so A2 holds H2H over A1)
  'demo-fix-blue-A-1': [26, 30],
  // idx 1: A1 vs A3 -> A1 wins 30-18
  'demo-fix-blue-A-2': [30, 18],
  // idx 2: A1 vs A4 -> A1 wins 30-20
  'demo-fix-blue-A-3': [30, 20],
  // idx 3: A2 vs A3 -> A3 wins 30-27 (creates 3-way or 2-way dynamic) -> actually let A2 win 30-25 and lose to A4 so A1 & A2 tie on 4 pts!
  'demo-fix-blue-A-4': [30, 25],
  // idx 4: A2 vs A4 -> A4 wins 30-24 (now A1 has 2W 1L = 4pts; A2 has 2W 1L = 4pts; A2 beat A1 H2H!)
  'demo-fix-blue-A-5': [24, 30],
  // idx 5: A3 vs A4 -> A3 wins 30-28 (now A3 has 1W 2L = 2pts; A4 has 1W 2L = 2pts)
  'demo-fix-blue-A-6': [30, 28],
};

function buildDemoResults(): MatchResult[] {
  const results: MatchResult[] = [];

  DEMO_FIXTURES.forEach((fixture, idx) => {
    if (fixture.status !== 'completed') {
      return;
    }

    const override = BLUE_A_OVERRIDES[fixture.id];
    let pair1Score: number;
    let pair2Score: number;

    if (override) {
      [pair1Score, pair2Score] = override;
    } else {
      // Deterministic realistic 30-point badminton score
      const pair1Wins = (idx * 7 + fixture.matchNumber.charCodeAt(0)) % 3 !== 0;
      const loserScore = 17 + ((idx * 5) % 12); // 17 to 28
      pair1Score = pair1Wins ? 30 : loserScore;
      pair2Score = pair1Wins ? loserScore : 30;
    }

    results.push({
      fixtureId: fixture.id,
      pair1Score,
      pair2Score,
      winnerPairId: pair1Score > pair2Score ? fixture.pair1Id : fixture.pair2Id,
      notes: 'Single game to 30 points (Demonstration)',
      isDemo: true,
    });
  });

  return results;
}

export const DEMO_RESULTS: MatchResult[] = buildDemoResults();

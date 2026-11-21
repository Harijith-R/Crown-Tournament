import type { DoublesPair } from '../types/tournament';
import { CONFIRMED_PAIR_SPECS } from './players';

/**
 * Confirmed official doubles pairs across Blue (8), Orange (17), and Yellow (9) — 34 total pairs.
 */
export const OFFICIAL_PAIRS: DoublesPair[] = CONFIRMED_PAIR_SPECS.map((spec) => ({
  id: spec.pairId,
  pairCode: `${spec.groupId}${spec.seedPosition}`,
  player1Id: `player-${spec.pairId}-1`,
  player2Id: `player-${spec.pairId}-2`,
  player1Name: spec.player1Name,
  player2Name: spec.player2Name,
  displayName: `${spec.player1Name} / ${spec.player2Name}`,
  categoryId: spec.categoryId,
  groupId: spec.groupId,
  seedPosition: spec.seedPosition,
}));

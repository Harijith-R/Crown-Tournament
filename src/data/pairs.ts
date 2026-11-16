import type { CategoryId, DoublesPair, GroupId } from '../types/tournament';
import { DEMO_PLAYERS } from './players';

/**
 * Official doubles pairs will be populated following the 18 November 2026 lottery.
 */
export const OFFICIAL_PAIRS: DoublesPair[] = [];

interface PairSlotSpec {
  categoryId: CategoryId;
  groupId: GroupId;
  seedPosition: number;
}

const DEMO_SLOTS: PairSlotSpec[] = [
  // Blue: 2 groups of 4 (8 pairs)
  ...([1, 2, 3, 4].map((n) => ({ categoryId: 'blue' as const, groupId: 'A' as const, seedPosition: n }))),
  ...([1, 2, 3, 4].map((n) => ({ categoryId: 'blue' as const, groupId: 'B' as const, seedPosition: n }))),
  // Orange: 4 groups of 5, 5, 4, 4 (18 pairs)
  ...([1, 2, 3, 4, 5].map((n) => ({ categoryId: 'orange' as const, groupId: 'A' as const, seedPosition: n }))),
  ...([1, 2, 3, 4, 5].map((n) => ({ categoryId: 'orange' as const, groupId: 'B' as const, seedPosition: n }))),
  ...([1, 2, 3, 4].map((n) => ({ categoryId: 'orange' as const, groupId: 'C' as const, seedPosition: n }))),
  ...([1, 2, 3, 4].map((n) => ({ categoryId: 'orange' as const, groupId: 'D' as const, seedPosition: n }))),
  // Yellow: 2 groups of 5 (10 pairs)
  ...([1, 2, 3, 4, 5].map((n) => ({ categoryId: 'yellow' as const, groupId: 'A' as const, seedPosition: n }))),
  ...([1, 2, 3, 4, 5].map((n) => ({ categoryId: 'yellow' as const, groupId: 'B' as const, seedPosition: n }))),
];

export const DEMO_PAIRS: DoublesPair[] = DEMO_SLOTS.map((slot, idx) => {
  const p1 = DEMO_PLAYERS[idx * 2];
  const p2 = DEMO_PLAYERS[idx * 2 + 1];
  const short1 = p1.name.split(' ')[0];
  const short2 = p2.name.split(' ')[0];
  return {
    id: `demo-pair-${slot.categoryId}-${slot.groupId}${slot.seedPosition}`,
    pairCode: `${slot.groupId}${slot.seedPosition}`,
    player1Id: p1.id,
    player2Id: p2.id,
    displayName: `${short1} / ${short2}`,
    categoryId: slot.categoryId,
    groupId: slot.groupId,
    seedPosition: slot.seedPosition,
    isDemo: true,
  };
});

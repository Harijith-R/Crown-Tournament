import type { GroupDefinition } from '../types/tournament';
import { CATEGORIES } from './categories';
import { OFFICIAL_PAIRS } from './pairs';

export const OFFICIAL_GROUPS: GroupDefinition[] = CATEGORIES.flatMap((category) =>
  category.groups.map((groupId) => ({
    id: `${category.id}-${groupId}`,
    categoryId: category.id,
    groupId,
    name: `Group ${groupId}`,
    capacity: category.groupSizes[groupId],
    pairIds: OFFICIAL_PAIRS.filter(
      (p) => p.categoryId === category.id && p.groupId === groupId
    )
      .sort((a, b) => a.seedPosition - b.seedPosition)
      .map((p) => p.id),
  }))
);

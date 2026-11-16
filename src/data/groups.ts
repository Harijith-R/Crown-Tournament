import type { GroupDefinition } from '../types/tournament';
import { CATEGORIES } from './categories';
import { DEMO_PAIRS } from './pairs';

export const OFFICIAL_GROUPS: GroupDefinition[] = CATEGORIES.flatMap((category) =>
  category.groups.map((groupId) => ({
    id: `${category.id}-${groupId}`,
    categoryId: category.id,
    groupId,
    name: `Group ${groupId}`,
    capacity: category.groupSizes[groupId],
    pairIds: [],
    isDemo: false,
  }))
);

export const DEMO_GROUPS: GroupDefinition[] = CATEGORIES.flatMap((category) =>
  category.groups.map((groupId) => ({
    id: `${category.id}-${groupId}`,
    categoryId: category.id,
    groupId,
    name: `Group ${groupId}`,
    capacity: category.groupSizes[groupId],
    pairIds: DEMO_PAIRS.filter(
      (p) => p.categoryId === category.id && p.groupId === groupId
    ).map((p) => p.id),
    isDemo: true,
  }))
);

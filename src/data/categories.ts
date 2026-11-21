import type { CategoryConfig, CategoryId } from '../types/tournament';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'blue',
    name: 'BLUE',
    tierLabel: 'Blue Category',
    totalPairs: 8,
    totalFixtures: 12,
    groupDistribution: '2 groups of 4',
    groups: ['A', 'B'],
    groupSizes: { A: 4, B: 4 },
    qualificationRule: 'Top 2 from each group qualify for semifinals.',
    qualifiersPerGroup: 2,
    knockoutRounds: ['Semifinals', 'Final'],
    accentHex: '#3B82F6',
    softBgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/35',
    textClass: 'text-blue-400',
    description:
      'An elite 8-pair sprint division split into two compact four-pair groups with 12 group-stage fixtures where every rally carries direct semifinal consequence.',
  },
  {
    id: 'orange',
    name: 'ORANGE',
    tierLabel: 'Orange Category',
    totalPairs: 17,
    totalFixtures: 28,
    groupDistribution: '4 groups containing 5, 4, 4 and 4 pairs',
    groups: ['A', 'B', 'C', 'D'],
    groupSizes: { A: 5, B: 4, C: 4, D: 4 },
    qualificationRule: 'Top 2 from each group qualify for quarter-finals.',
    qualifiersPerGroup: 2,
    knockoutRounds: ['Quarter-finals', 'Semifinals', 'Final'],
    accentHex: '#F97316',
    softBgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/35',
    textClass: 'text-orange-400',
    description:
      'The tournament’s largest championship bracket featuring 17 pairs across four demanding groups and 28 group-stage fixtures leading into an eight-pair quarter-final gauntlet.',
  },
  {
    id: 'yellow',
    name: 'YELLOW',
    tierLabel: 'Yellow Category',
    totalPairs: 9,
    totalFixtures: 16,
    groupDistribution: '2 groups containing 5 and 4 pairs',
    groups: ['A', 'B'],
    groupSizes: { A: 5, B: 4 },
    qualificationRule: 'Top 2 from each group qualify for semifinals.',
    qualifiersPerGroup: 2,
    knockoutRounds: ['Semifinals', 'Final'],
    accentHex: '#EAB308',
    softBgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/35',
    textClass: 'text-yellow-300',
    description:
      'Nine determined doubles pairings divided across Group A (5 pairs) and Group B (4 pairs) with 16 round-robin fixtures on the path to the semifinals.',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryConfig> = {
  blue: CATEGORIES[0],
  orange: CATEGORIES[1],
  yellow: CATEGORIES[2],
};

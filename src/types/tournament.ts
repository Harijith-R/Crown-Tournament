export type CategoryId = 'blue' | 'orange' | 'yellow';

export type GroupId = 'A' | 'B' | 'C' | 'D';

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'postponed';

export type KnockoutRoundName = 'Quarter-finals' | 'Semifinals' | 'Final';

export interface TournamentMilestone {
  date: string;
  title: string;
  description: string;
  phase: 'verification' | 'registration' | 'lottery' | 'group' | 'contingency' | 'finals';
}

export interface TournamentStat {
  label: string;
  value: string;
  detail: string;
}

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  tierLabel: string;
  totalPairs: number;
  groupDistribution: string;
  groups: GroupId[];
  groupSizes: Record<string, number>;
  qualificationRule: string;
  qualifiersPerGroup: number;
  knockoutRounds: KnockoutRoundName[];
  accentHex: string;
  softBgClass: string;
  borderClass: string;
  textClass: string;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  categoryId: CategoryId;
  club?: string;
  isDemo?: boolean;
}

export interface DoublesPair {
  id: string;
  pairCode: string;
  player1Id: string;
  player2Id: string;
  displayName: string;
  categoryId: CategoryId;
  groupId: GroupId;
  seedPosition: number;
  isDemo?: boolean;
}

export interface GroupDefinition {
  id: string;
  categoryId: CategoryId;
  groupId: GroupId;
  name: string;
  capacity: number;
  pairIds: string[];
  isDemo?: boolean;
}

export interface FixtureMatch {
  id: string;
  matchNumber: string;
  categoryId: CategoryId;
  groupId: GroupId;
  stage: 'group' | 'knockout';
  knockoutRound?: KnockoutRoundName;
  pair1Id: string;
  pair2Id: string;
  date: string;
  time: string;
  court: string;
  status: MatchStatus;
  isDemo?: boolean;
}

export interface MatchResult {
  fixtureId: string;
  pair1Score: number;
  pair2Score: number;
  winnerPairId: string;
  notes?: string;
  isDemo?: boolean;
}

export interface StandingRow {
  position: number;
  pairId: string;
  pairCode: string;
  pairName: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  difference: number;
  tablePoints: number;
  qualified: boolean;
  tieBreakerApplied?: 'head-to-head' | 'point-difference' | 'total-points' | null;
}

export interface KnockoutSlot {
  id: string;
  round: KnockoutRoundName;
  matchLabel: string;
  pair1Label: string;
  pair2Label: string;
  pair1Name?: string;
  pair2Name?: string;
  pair1Score?: number;
  pair2Score?: number;
  winnerName?: string;
  status: MatchStatus;
  court?: string;
  date?: string;
  time?: string;
}

export interface CategoryStatistics {
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  postponedMatches: number;
  totalPointsScored: number;
  highestMatchTotal: number;
}

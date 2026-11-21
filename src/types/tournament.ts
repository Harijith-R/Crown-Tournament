export type CategoryId = 'blue' | 'orange' | 'yellow';

export type GroupId = 'A' | 'B' | 'C' | 'D';

export type MatchStatus =
  | 'To Be Played'
  | 'Postponed'
  | 'Played'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Walkover';

export type KnockoutRoundName = 'Quarter-finals' | 'Semifinals' | 'Final';

export type OfficialCourt = 'Court 3' | 'Court 4' | 'Court 5';

export type WarmUpCourt = 'Court 1' | 'Court 2';

export interface CourtAllocationEntry {
  court: WarmUpCourt | OfficialCourt;
  role: 'warm-up' | 'official';
  purpose: string;
  availabilityNote: string;
}

export interface StageScoringConfig {
  groupStagePoints: number;
  knockoutStagePoints: number;
  finalsPoints: number;
  winTablePoints: number;
  lossTablePoints: number;
  tieBreakerRule: 'Total Points Scored';
}

export interface ScheduleCapacityConfig {
  weekdayMaxMatchesPerDay: number;
  weekendMaxMatchesPerDay: number;
  officialMatchCourts: readonly OfficialCourt[];
  warmUpCourts: readonly WarmUpCourt[];
}

export interface TournamentMilestone {
  date: string;
  title: string;
  description: string;
  phase: 'verification' | 'registration' | 'lottery' | 'group' | 'contingency' | 'finals' | 'relay';
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
  totalFixtures: number;
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
  pairId: string;
  club?: string;
}

export interface DoublesPair {
  id: string;
  pairCode: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  displayName: string;
  categoryId: CategoryId;
  groupId: GroupId;
  seedPosition: number;
}

export interface GroupDefinition {
  id: string;
  categoryId: CategoryId;
  groupId: GroupId;
  name: string;
  capacity: number;
  pairIds: string[];
}

export interface FixtureMatch {
  id: string;
  matchNumber: string;
  scheduleOrder: number;
  date: string;
  isoDate: string;
  day: string;
  court: OfficialCourt;
  categoryId: CategoryId;
  groupId: GroupId;
  stage: 'group' | 'knockout';
  stageLabel: 'Group Stage' | KnockoutRoundName;
  knockoutRound?: KnockoutRoundName;
  match: string;
  pair1Id: string;
  pair2Id: string;
  score: string;
  winner: string;
  status: MatchStatus;
  remarks: string;
}

export interface MatchResult {
  fixtureId: string;
  pair1Score: number;
  pair2Score: number;
  winnerPairId: string;
  notes?: string;
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
  tieBreakerApplied?: 'total-points' | null;
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
  court?: OfficialCourt;
  date?: string;
  time?: string;
}

export interface CategoryStatistics {
  totalMatches: number;
  completedMatches: number;
  toBePlayedMatches: number;
  postponedMatches: number;
  totalPointsScored: number;
  highestMatchTotal: number;
}

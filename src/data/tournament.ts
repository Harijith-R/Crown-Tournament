import type {
  CourtAllocationEntry,
  ScheduleCapacityConfig,
  StageScoringConfig,
  TournamentMilestone,
  TournamentStat,
} from '../types/tournament';

export const OFFICIAL_FIXTURES_PUBLISHED = true;

export const STAGE_SCORING_CONFIG: StageScoringConfig = {
  groupStagePoints: 21,
  knockoutStagePoints: 30,
  finalsPoints: 30,
  winTablePoints: 2,
  lossTablePoints: 0,
  tieBreakerRule: 'Total Points Scored',
};

export const SCHEDULE_CAPACITY_CONFIG: ScheduleCapacityConfig = {
  weekdayMaxMatchesPerDay: 4,
  weekendMaxMatchesPerDay: 8,
  officialMatchCourts: ['Court 3', 'Court 4', 'Court 5'],
  warmUpCourts: ['Court 1', 'Court 2'],
};

export const COURT_ALLOCATION: CourtAllocationEntry[] = [
  {
    court: 'Court 1',
    role: 'warm-up',
    purpose: 'Player warm-up, only if available',
    availabilityNote: 'Subject to availability; never assigned to official tournament matches.',
  },
  {
    court: 'Court 2',
    role: 'warm-up',
    purpose: 'Player warm-up, only if available',
    availabilityNote: 'Subject to availability; never assigned to official tournament matches.',
  },
  {
    court: 'Court 3',
    role: 'official',
    purpose: 'Official tournament matches',
    availabilityNote: 'Dedicated official championship match court.',
  },
  {
    court: 'Court 4',
    role: 'official',
    purpose: 'Official tournament matches',
    availabilityNote: 'Dedicated official championship match court.',
  },
  {
    court: 'Court 5',
    role: 'official',
    purpose: 'Official tournament matches',
    availabilityNote: 'Dedicated official championship match court.',
  },
];

export const COMMITTEE_AUTHORITY_STATEMENT =
  "In case of any issues or problems, the committee's decision will be final.";

export const TOURNAMENT_INFO = {
  title: 'CROWN TOURNAMENT 2026',
  subtitle: 'THE BATTLE FOR THE CROWN',
  discipline: "Men's Doubles Badminton Championship",
  venueName: 'MUTHOOTH BADMINTON ACADEMY',
  venueAddress: 'Sabarmathi Road, Near Jawaharlal Nehru Stadium, Kaloor, Kochi, Kerala 682025, India',
  venueHighlights: [
    'Courts 3, 4 & 5: Official Tournament Matches',
    'Courts 1 & 2: Player Warm-Up (Only If Available)',
    'Glare-Free Lighting & Players Lounge',
  ],
  mapsUrl: 'https://maps.app.goo.gl/pQaPfBCuqZW93MdG8',
  dateRange: '28 NOVEMBER – 13 DECEMBER 2026',
  finalsDate: '13 December 2026',
  relayTournamentNote: '13 December 2026, after the finals',
  heroIntro:
    'Where precision meets passion, and partnerships define champions. A celebration of competitive badminton, bringing together the members of MUTHOOT ALWIN’S BADMINTON ACADEMY in pursuit of championship glory.',
  committeeStatement: COMMITTEE_AUTHORITY_STATEMENT,
  rulesSummary: [
    { label: 'Format', value: "Men's doubles" },
    { label: 'Group Stage Scoring', value: '21 points per game' },
    { label: 'Knockouts & Finals', value: '30 points per game' },
    { label: 'Group Format', value: 'Round-robin group stage' },
    { label: 'Match Win', value: '2 table points' },
    { label: 'Match Loss', value: '0 table points' },
  ],
  tieBreakers: [
    {
      rank: 1,
      title: 'Total Points Scored',
      description:
        'When pairs finish level on table points within a group, rankings are separated exclusively by cumulative rally points scored across group-stage play.',
    },
  ],
  lotteryStages: [
    {
      stage: '01',
      title: 'Doubles Partner Lots',
      description:
        'A transparent random drawing of lots pairs verified entrants within their assigned category to establish balanced, unpredictable partnerships.',
    },
    {
      stage: '02',
      title: 'Group Position Allocation',
      description:
        'A second independent lots draw assigns each formed pair to predefined proxy group slots (e.g., A1–A5, B1–B4) in full view of participants.',
    },
    {
      stage: '03',
      title: 'Pre-Established Fixture Matrix',
      description:
        'All proxy match schedules and court orders are locked before the lots begin—ensuring complete transparency and zero post-draw manipulation.',
    },
  ],
} as const;

export const TOURNAMENT_STATS: TournamentStat[] = [
  {
    label: 'Confirmed Draw',
    value: '34 Doubles Pairs',
    detail: '8 Blue · 17 Orange · 9 Yellow across 3 categories',
  },
  {
    label: 'Group Schedule',
    value: '56 Fixtures',
    detail: '12 Blue · 28 Orange · 16 Yellow group-stage matches',
  },
  {
    label: 'Official Courts',
    value: 'Courts 3, 4 & 5',
    detail: 'Courts 1 & 2 for warm-up only, subject to availability',
  },
  {
    label: 'Stage Scoring',
    value: '21 / 30 Points',
    detail: '21 pts group stage · 30 pts knockouts & finals',
  },
];

export const TOURNAMENT_TIMELINE: TournamentMilestone[] = [
  {
    date: '12 November 2026',
    title: 'Player Verification Deadline',
    description: 'Final eligibility check and player category confirmation completed.',
    phase: 'verification',
  },
  {
    date: '17 November 2026',
    title: 'Registration Deadline',
    description: 'Official closing of championship entries across Blue, Orange, and Yellow tiers.',
    phase: 'registration',
  },
  {
    date: '18 November 2026',
    title: 'Doubles Partner Lots',
    description: 'Two-stage transparent draw pairing partners and assigning predefined group slots.',
    phase: 'lottery',
  },
  {
    date: '28 November 2026',
    title: 'Tournament Begins',
    description: 'Opening ceremony and inaugural round-robin fixtures at Muthooth Badminton Academy.',
    phase: 'group',
  },
  {
    date: '08 December 2026',
    title: 'Scheduled Group-Stage Conclusion',
    description: 'Completion of the 56 scheduled group-stage round-robin fixtures across Courts 3, 4, and 5.',
    phase: 'group',
  },
  {
    date: '12 December 2026',
    title: 'Contingency Day',
    description: 'Reserved schedule buffer for postponed fixtures or tie-resolution play.',
    phase: 'contingency',
  },
  {
    date: '13 December 2026',
    title: 'Category Finals',
    description: 'Championship deciders and coronation of the 2026 Crown Tournament champions.',
    phase: 'finals',
  },
  {
    date: '13 December 2026 (Post-Finals)',
    title: 'Relay Tournament',
    description: 'Scheduled to take place after the Crown Tournament finals conclude on 13 December 2026.',
    phase: 'relay',
  },
];

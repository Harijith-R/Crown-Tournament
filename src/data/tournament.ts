import type { TournamentMilestone, TournamentStat } from '../types/tournament';

export const OFFICIAL_FIXTURES_PUBLISHED = false;

export const TOURNAMENT_INFO = {
  title: 'CROWN TOURNAMENT 2026',
  subtitle: 'THE BATTLE FOR THE CROWN',
  discipline: "Men's Doubles Badminton Championship",
  venueName: 'MUTHOOTH BADMINTON ACADEMY',
  venueAddress: 'Sabarmathi Road, Near Jawaharlal Nehru Stadium, Kaloor, Kochi, Kerala 682025, India',
  venueHighlights: [
    '5 Championship Indoor Wooden Courts',
    'Professional Glare-Free Tournament Lighting',
    'Spectator Viewing & Players Lounge',
  ],
  mapsUrl: 'https://maps.app.goo.gl/pQaPfBCuqZW93MdG8',
  dateRange: '28 NOVEMBER – 13 DECEMBER 2026',
  heroIntro:
    'Where precision meets passion, and partnerships define champions. A celebration of competitive badminton, bringing together the members of MUTHOOT ALWIN’S BADMINTON ACADEMY in pursuit of championship glory.',
  rulesSummary: [
    { label: 'Format', value: "Men's doubles" },
    { label: 'Match Length', value: 'Single game to 30 points' },
    { label: 'Scoring System', value: 'Rally point scoring' },
    { label: 'Group Format', value: 'Round-robin group stage' },
    { label: 'Match Win', value: '2 table points' },
    { label: 'Match Loss', value: '0 table points' },
  ],
  tieBreakers: [
    {
      rank: 1,
      title: 'Head-to-Head',
      description: 'Direct match outcome and head-to-head point differential between tied pairings.',
    },
    {
      rank: 2,
      title: 'Point Difference',
      description: 'Net difference between cumulative points scored and points conceded across group play.',
    },
    {
      rank: 3,
      title: 'Total Points Scored',
      description: 'Aggregate rally points won across all group-stage matches.',
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
        'A second independent lots draw assigns each formed pair to predefined proxy group slots (e.g., A1–A5, B1–B5) in full view of participants.',
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
    label: 'Competitive Tiers',
    value: '3 Categories',
    detail: 'Blue, Orange & Yellow divisions',
  },
  {
    label: 'Championship Draw',
    value: '36 Doubles Pairs',
    detail: 'Balanced across 8 round-robin groups',
  },
  {
    label: 'Verified Roster',
    value: '69 Planned Players',
    detail: 'Competing for crown championship titles',
  },
  {
    label: 'Sprint Format',
    value: '30 Points per Match',
    detail: 'Single-game rally point intensity',
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
    date: '10 December 2026',
    title: 'Target Group-Stage Completion',
    description: 'Scheduled conclusion of all round-robin group battles and qualifier standings.',
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
];

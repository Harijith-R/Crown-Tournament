import type {
  CategoryId,
  FixtureMatch,
  GroupId,
  MatchStatus,
  OfficialCourt,
} from '../types/tournament';
import { OFFICIAL_PAIRS } from './pairs';
import { SCHEDULE_CAPACITY_CONFIG } from './tournament';

export const OFFICIAL_MATCH_COURTS: readonly OfficialCourt[] =
  SCHEDULE_CAPACITY_CONFIG.officialMatchCourts;

interface RawFixtureSpec {
  date: string;
  isoDate: string;
  day: string;
  court: OfficialCourt;
  categoryId: CategoryId;
  groupId: GroupId;
  pair1Id: string;
  pair2Id: string;
  status: MatchStatus;
  score?: string;
  winner?: string;
  remarks?: string;
}

const PAIR_LOOKUP = new Map(OFFICIAL_PAIRS.map((pair) => [pair.id, pair]));

/**
 * Authoritative 56 group-stage fixtures (Blue: 12, Orange: 28, Yellow: 16).
 * Preserves exact dates, days, official match courts (Courts 3, 4, 5), groups, matchups,
 * chronological sequence, and Postponed statuses from the confirmed schedule.
 */
const RAW_OFFICIAL_FIXTURES: RawFixtureSpec[] = [
  // 28-Nov-2026 (Saturday) — 8 matches
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 5', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y04', pair2Id: 'Y06', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 5', categoryId: 'orange', groupId: 'A', pair1Id: 'O09', pair2Id: 'O17', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 4', categoryId: 'blue', groupId: 'A', pair1Id: 'B01', pair2Id: 'B05', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 4', categoryId: 'orange', groupId: 'D', pair1Id: 'O08', pair2Id: 'O12', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 5', categoryId: 'orange', groupId: 'C', pair1Id: 'O03', pair2Id: 'O07', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 4', categoryId: 'orange', groupId: 'C', pair1Id: 'O03', pair2Id: 'O15', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 3', categoryId: 'blue', groupId: 'A', pair1Id: 'B03', pair2Id: 'B05', status: 'To Be Played' },
  { date: '28-Nov-2026', isoDate: '2026-11-28', day: 'Saturday', court: 'Court 3', categoryId: 'blue', groupId: 'B', pair1Id: 'B02', pair2Id: 'B08', status: 'To Be Played' },

  // 29-Nov-2026 (Sunday) — 8 matches
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 4', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y07', pair2Id: 'Y09', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 3', categoryId: 'orange', groupId: 'A', pair1Id: 'O01', pair2Id: 'O13', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 4', categoryId: 'orange', groupId: 'B', pair1Id: 'O10', pair2Id: 'O14', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 5', categoryId: 'orange', groupId: 'A', pair1Id: 'O01', pair2Id: 'O05', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 3', categoryId: 'orange', groupId: 'C', pair1Id: 'O07', pair2Id: 'O15', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 5', categoryId: 'blue', groupId: 'B', pair1Id: 'B04', pair2Id: 'B06', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 4', categoryId: 'orange', groupId: 'A', pair1Id: 'O05', pair2Id: 'O17', status: 'To Be Played' },
  { date: '29-Nov-2026', isoDate: '2026-11-29', day: 'Sunday', court: 'Court 5', categoryId: 'orange', groupId: 'A', pair1Id: 'O09', pair2Id: 'O13', status: 'To Be Played' },

  // 30-Nov-2026 (Monday) — 4 matches
  { date: '30-Nov-2026', isoDate: '2026-11-30', day: 'Monday', court: 'Court 5', categoryId: 'orange', groupId: 'D', pair1Id: 'O12', pair2Id: 'O16', status: 'To Be Played' },
  { date: '30-Nov-2026', isoDate: '2026-11-30', day: 'Monday', court: 'Court 5', categoryId: 'orange', groupId: 'B', pair1Id: 'O02', pair2Id: 'O14', status: 'Postponed' },
  { date: '30-Nov-2026', isoDate: '2026-11-30', day: 'Monday', court: 'Court 4', categoryId: 'orange', groupId: 'A', pair1Id: 'O01', pair2Id: 'O09', status: 'To Be Played' },
  { date: '30-Nov-2026', isoDate: '2026-11-30', day: 'Monday', court: 'Court 3', categoryId: 'orange', groupId: 'A', pair1Id: 'O05', pair2Id: 'O09', status: 'To Be Played' },

  // 01-Dec-2026 (Tuesday) — 4 matches
  { date: '01-Dec-2026', isoDate: '2026-12-01', day: 'Tuesday', court: 'Court 3', categoryId: 'orange', groupId: 'D', pair1Id: 'O04', pair2Id: 'O12', status: 'To Be Played' },
  { date: '01-Dec-2026', isoDate: '2026-12-01', day: 'Tuesday', court: 'Court 5', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y03', pair2Id: 'Y09', status: 'To Be Played' },
  { date: '01-Dec-2026', isoDate: '2026-12-01', day: 'Tuesday', court: 'Court 4', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y03', pair2Id: 'Y07', status: 'To Be Played' },
  { date: '01-Dec-2026', isoDate: '2026-12-01', day: 'Tuesday', court: 'Court 5', categoryId: 'blue', groupId: 'B', pair1Id: 'B02', pair2Id: 'B04', status: 'To Be Played' },

  // 02-Dec-2026 (Wednesday) — 4 matches
  { date: '02-Dec-2026', isoDate: '2026-12-02', day: 'Wednesday', court: 'Court 5', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y05', pair2Id: 'Y09', status: 'To Be Played' },
  { date: '02-Dec-2026', isoDate: '2026-12-02', day: 'Wednesday', court: 'Court 4', categoryId: 'orange', groupId: 'D', pair1Id: 'O04', pair2Id: 'O08', status: 'To Be Played' },
  { date: '02-Dec-2026', isoDate: '2026-12-02', day: 'Wednesday', court: 'Court 5', categoryId: 'orange', groupId: 'C', pair1Id: 'O03', pair2Id: 'O11', status: 'To Be Played' },
  { date: '02-Dec-2026', isoDate: '2026-12-02', day: 'Wednesday', court: 'Court 3', categoryId: 'orange', groupId: 'C', pair1Id: 'O07', pair2Id: 'O11', status: 'To Be Played' },

  // 03-Dec-2026 (Thursday) — 4 matches
  { date: '03-Dec-2026', isoDate: '2026-12-03', day: 'Thursday', court: 'Court 5', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y01', pair2Id: 'Y03', status: 'To Be Played' },
  { date: '03-Dec-2026', isoDate: '2026-12-03', day: 'Thursday', court: 'Court 3', categoryId: 'blue', groupId: 'A', pair1Id: 'B01', pair2Id: 'B07', status: 'To Be Played' },
  { date: '03-Dec-2026', isoDate: '2026-12-03', day: 'Thursday', court: 'Court 5', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y06', pair2Id: 'Y08', status: 'To Be Played' },
  { date: '03-Dec-2026', isoDate: '2026-12-03', day: 'Thursday', court: 'Court 4', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y05', pair2Id: 'Y07', status: 'To Be Played' },

  // 05-Dec-2026 (Saturday) — 8 matches
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 5', categoryId: 'orange', groupId: 'B', pair1Id: 'O06', pair2Id: 'O14', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 3', categoryId: 'orange', groupId: 'A', pair1Id: 'O01', pair2Id: 'O17', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 3', categoryId: 'blue', groupId: 'B', pair1Id: 'B02', pair2Id: 'B06', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 4', categoryId: 'orange', groupId: 'D', pair1Id: 'O04', pair2Id: 'O16', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 5', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y01', pair2Id: 'Y07', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 4', categoryId: 'orange', groupId: 'B', pair1Id: 'O06', pair2Id: 'O10', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 4', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y01', pair2Id: 'Y09', status: 'To Be Played' },
  { date: '05-Dec-2026', isoDate: '2026-12-05', day: 'Saturday', court: 'Court 5', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y02', pair2Id: 'Y06', status: 'To Be Played' },

  // 06-Dec-2026 (Sunday) — 8 matches
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 3', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y01', pair2Id: 'Y05', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 5', categoryId: 'yellow', groupId: 'A', pair1Id: 'Y03', pair2Id: 'Y05', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 5', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y02', pair2Id: 'Y08', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 3', categoryId: 'orange', groupId: 'B', pair1Id: 'O02', pair2Id: 'O10', status: 'Postponed' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 5', categoryId: 'blue', groupId: 'B', pair1Id: 'B06', pair2Id: 'B08', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 4', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y04', pair2Id: 'Y08', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 4', categoryId: 'blue', groupId: 'A', pair1Id: 'B01', pair2Id: 'B03', status: 'To Be Played' },
  { date: '06-Dec-2026', isoDate: '2026-12-06', day: 'Sunday', court: 'Court 4', categoryId: 'blue', groupId: 'A', pair1Id: 'B03', pair2Id: 'B07', status: 'To Be Played' },

  // 07-Dec-2026 (Monday) — 4 matches
  { date: '07-Dec-2026', isoDate: '2026-12-07', day: 'Monday', court: 'Court 5', categoryId: 'orange', groupId: 'A', pair1Id: 'O13', pair2Id: 'O17', status: 'To Be Played' },
  { date: '07-Dec-2026', isoDate: '2026-12-07', day: 'Monday', court: 'Court 3', categoryId: 'blue', groupId: 'A', pair1Id: 'B05', pair2Id: 'B07', status: 'To Be Played' },
  { date: '07-Dec-2026', isoDate: '2026-12-07', day: 'Monday', court: 'Court 5', categoryId: 'orange', groupId: 'D', pair1Id: 'O08', pair2Id: 'O16', status: 'To Be Played' },
  { date: '07-Dec-2026', isoDate: '2026-12-07', day: 'Monday', court: 'Court 4', categoryId: 'yellow', groupId: 'B', pair1Id: 'Y02', pair2Id: 'Y04', status: 'To Be Played' },

  // 08-Dec-2026 (Tuesday) — 4 matches
  { date: '08-Dec-2026', isoDate: '2026-12-08', day: 'Tuesday', court: 'Court 5', categoryId: 'orange', groupId: 'B', pair1Id: 'O02', pair2Id: 'O06', status: 'To Be Played' },
  { date: '08-Dec-2026', isoDate: '2026-12-08', day: 'Tuesday', court: 'Court 4', categoryId: 'orange', groupId: 'A', pair1Id: 'O05', pair2Id: 'O13', status: 'To Be Played' },
  { date: '08-Dec-2026', isoDate: '2026-12-08', day: 'Tuesday', court: 'Court 3', categoryId: 'blue', groupId: 'B', pair1Id: 'B04', pair2Id: 'B08', status: 'To Be Played' },
  { date: '08-Dec-2026', isoDate: '2026-12-08', day: 'Tuesday', court: 'Court 5', categoryId: 'orange', groupId: 'C', pair1Id: 'O11', pair2Id: 'O15', status: 'To Be Played' },
];

export const OFFICIAL_FIXTURES: FixtureMatch[] = RAW_OFFICIAL_FIXTURES.map((spec, index) => {
  const pair1 = PAIR_LOOKUP.get(spec.pair1Id);
  const pair2 = PAIR_LOOKUP.get(spec.pair2Id);
  const pair1Name = pair1?.displayName ?? spec.pair1Id;
  const pair2Name = pair2?.displayName ?? spec.pair2Id;
  const orderNumber = index + 1;

  return {
    id: `fix-${String(orderNumber).padStart(2, '0')}`,
    matchNumber: `M${String(orderNumber).padStart(2, '0')}`,
    scheduleOrder: orderNumber,
    date: spec.date,
    isoDate: spec.isoDate,
    day: spec.day,
    court: spec.court,
    categoryId: spec.categoryId,
    groupId: spec.groupId,
    stage: 'group',
    stageLabel: 'Group Stage',
    match: `${pair1Name} vs ${pair2Name}`,
    pair1Id: spec.pair1Id,
    pair2Id: spec.pair2Id,
    score: spec.score ?? '',
    winner: spec.winner ?? '',
    status: spec.status,
    remarks: spec.remarks ?? '',
  };
});

export const OFFICIAL_FIXTURE_DATES: string[] = Array.from(
  new Set(OFFICIAL_FIXTURES.map((f) => f.date))
);

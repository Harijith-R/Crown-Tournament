import type { CategoryId, GroupId, Player } from '../types/tournament';

export interface ConfirmedPairSpec {
  pairId: string;
  categoryId: CategoryId;
  groupId: GroupId;
  seedPosition: number;
  player1Name: string;
  player2Name: string;
}

export const CONFIRMED_PAIR_SPECS: ConfirmedPairSpec[] = [
  // Blue Category – 8 Pairs (Group A = 4, Group B = 4)
  { pairId: 'B01', categoryId: 'blue', groupId: 'A', seedPosition: 1, player1Name: 'Denny', player2Name: 'Suchith' },
  { pairId: 'B03', categoryId: 'blue', groupId: 'A', seedPosition: 2, player1Name: 'Manoj', player2Name: 'Vivek' },
  { pairId: 'B05', categoryId: 'blue', groupId: 'A', seedPosition: 3, player1Name: 'Alan', player2Name: 'Ganesh' },
  { pairId: 'B07', categoryId: 'blue', groupId: 'A', seedPosition: 4, player1Name: 'Rajiv', player2Name: 'Nibin' },
  { pairId: 'B02', categoryId: 'blue', groupId: 'B', seedPosition: 1, player1Name: 'Anush', player2Name: 'Ajmal' },
  { pairId: 'B04', categoryId: 'blue', groupId: 'B', seedPosition: 2, player1Name: 'Jinil', player2Name: 'Harijith' },
  { pairId: 'B06', categoryId: 'blue', groupId: 'B', seedPosition: 3, player1Name: 'Pramod', player2Name: 'Vishnu' },
  { pairId: 'B08', categoryId: 'blue', groupId: 'B', seedPosition: 4, player1Name: 'Siyad', player2Name: 'Ajay' },

  // Orange Category – 17 Pairs (Group A = 5, Group B = 4, Group C = 4, Group D = 4)
  { pairId: 'O01', categoryId: 'orange', groupId: 'A', seedPosition: 1, player1Name: 'Sajith', player2Name: 'Vishnu 5 AM' },
  { pairId: 'O05', categoryId: 'orange', groupId: 'A', seedPosition: 2, player1Name: 'Anand John', player2Name: 'Mahipal' },
  { pairId: 'O09', categoryId: 'orange', groupId: 'A', seedPosition: 3, player1Name: 'Prasanth', player2Name: 'Manoj' },
  { pairId: 'O13', categoryId: 'orange', groupId: 'A', seedPosition: 4, player1Name: 'Younus', player2Name: 'Ajith TS' },
  { pairId: 'O17', categoryId: 'orange', groupId: 'A', seedPosition: 5, player1Name: 'Alex', player2Name: 'Sinoy' },
  { pairId: 'O02', categoryId: 'orange', groupId: 'B', seedPosition: 1, player1Name: 'Nandakumar', player2Name: 'Jinosh' },
  { pairId: 'O06', categoryId: 'orange', groupId: 'B', seedPosition: 2, player1Name: 'Vinod', player2Name: 'Gautham' },
  { pairId: 'O10', categoryId: 'orange', groupId: 'B', seedPosition: 3, player1Name: 'Vinu', player2Name: 'Dinoop' },
  { pairId: 'O14', categoryId: 'orange', groupId: 'B', seedPosition: 4, player1Name: 'Mansoor', player2Name: 'Jithesh' },
  { pairId: 'O03', categoryId: 'orange', groupId: 'C', seedPosition: 1, player1Name: 'Ajith Mathew', player2Name: 'Balu' },
  { pairId: 'O07', categoryId: 'orange', groupId: 'C', seedPosition: 2, player1Name: 'Ajas', player2Name: 'Akash' },
  { pairId: 'O11', categoryId: 'orange', groupId: 'C', seedPosition: 3, player1Name: 'Deepesh', player2Name: 'Dinesh' },
  { pairId: 'O15', categoryId: 'orange', groupId: 'C', seedPosition: 4, player1Name: 'Antony David', player2Name: 'Lakshmi Suchith' },
  { pairId: 'O04', categoryId: 'orange', groupId: 'D', seedPosition: 1, player1Name: 'Arun Kumar', player2Name: 'Unni' },
  { pairId: 'O08', categoryId: 'orange', groupId: 'D', seedPosition: 2, player1Name: 'Rajesh', player2Name: 'Santosh' },
  { pairId: 'O12', categoryId: 'orange', groupId: 'D', seedPosition: 3, player1Name: 'Jibin', player2Name: 'Shafeek' },
  { pairId: 'O16', categoryId: 'orange', groupId: 'D', seedPosition: 4, player1Name: 'Binu', player2Name: 'Ashim' },

  // Yellow Category – 9 Pairs (Group A = 5, Group B = 4)
  { pairId: 'Y01', categoryId: 'yellow', groupId: 'A', seedPosition: 1, player1Name: 'Midhun', player2Name: 'Upendra' },
  { pairId: 'Y03', categoryId: 'yellow', groupId: 'A', seedPosition: 2, player1Name: 'Manoj', player2Name: 'Pradeep' },
  { pairId: 'Y05', categoryId: 'yellow', groupId: 'A', seedPosition: 3, player1Name: 'Jayan', player2Name: 'Sam Jerry' },
  { pairId: 'Y07', categoryId: 'yellow', groupId: 'A', seedPosition: 4, player1Name: 'Jenson', player2Name: 'Rajan' },
  { pairId: 'Y09', categoryId: 'yellow', groupId: 'A', seedPosition: 5, player1Name: 'Goutham', player2Name: 'Ullas' },
  { pairId: 'Y02', categoryId: 'yellow', groupId: 'B', seedPosition: 1, player1Name: 'Bibu', player2Name: 'Vismaya' },
  { pairId: 'Y04', categoryId: 'yellow', groupId: 'B', seedPosition: 2, player1Name: 'Vicky', player2Name: 'Abishek' },
  { pairId: 'Y06', categoryId: 'yellow', groupId: 'B', seedPosition: 3, player1Name: 'Vishnu Krishnan', player2Name: 'Jeevan' },
  { pairId: 'Y08', categoryId: 'yellow', groupId: 'B', seedPosition: 4, player1Name: 'Akhil George', player2Name: 'Arul A' },
];

/**
 * Distinct official player records for every confirmed participant (68 players across 34 pairs).
 * Players who share a first name across categories (e.g. Manoj, Vishnu) remain separate records.
 */
export const OFFICIAL_PLAYERS: Player[] = CONFIRMED_PAIR_SPECS.flatMap((spec) => [
  {
    id: `player-${spec.pairId}-1`,
    name: spec.player1Name,
    categoryId: spec.categoryId,
    pairId: spec.pairId,
    club: 'Muthooth Badminton Academy',
  },
  {
    id: `player-${spec.pairId}-2`,
    name: spec.player2Name,
    categoryId: spec.categoryId,
    pairId: spec.pairId,
    club: 'Muthooth Badminton Academy',
  },
]);

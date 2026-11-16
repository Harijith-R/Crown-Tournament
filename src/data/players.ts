import type { Player } from '../types/tournament';

/**
 * Official player roster remains empty until verification & registration close.
 */
export const OFFICIAL_PLAYERS: Player[] = [];

/**
 * Demonstration roster used ONLY when the user activates "Demo Preview"
 * on the Fixtures & Results dashboard.
 */
const DEMO_NAMES = [
  'Arjun Nair', 'Vishnu Menon', 'Karthik Varma', 'Rohan Pillai',
  'Siddharth Iyer', 'Nikhil Kurian', 'Pranav Thomas', 'Akhil George',
  'Deepak Mathew', 'Rahul Raj', 'Anand Krishnan', 'Sreejith Babu',
  'Vivek Joseph', 'Gokul Das', 'Harish Nambiar', 'Ashwin Kurup',
  'Abhishek Mohan', 'Varun Warrier', 'Nitin Abraham', 'Sujith Panicker',
  'Manoj Sebastian', 'Ajith Cherian', 'Anoop Varghese', 'Rakesh Shenoy',
  'Sandeep Bhatt', 'Naveen Pai', 'Kiran Hegde', 'Mahesh Prabhu',
  'Jithin Jacob', 'Suraj Zachariah', 'Adarsh Balan', 'Midhun Kumar',
  'Sajin Antony', 'Dileep Francis', 'Vinay Alexander', 'Binu Philip',
  'Rajeev Menon', 'Shyam Krishnan', 'Fazil Rahman', 'Imran Rasheed',
  'Tariq Salam', 'Nabeel Aziz', 'Zaid Kareem', 'Riyas Majeed',
  'Shafeek Ali', 'Ameen Hameed', 'Aravind Sankar', 'Devraj Thampi',
  'Praveen Chandran', 'Sooraj Vijayan', 'Unni Madhavan', 'Gireesh Narayanan',
  'Subin Paul', 'Toby Joy', 'Lijo Xavier', 'Rony Sunny',
  'Ebin Baby', 'Jijo Davis', 'Albin Benny', 'Jomon Cyriac',
  'Santhosh Kumar', 'Renjith Murali', 'Kailas Nath', 'Sharan Menon',
  'Prajith Unni', 'Aswin Vasu', 'Nikhilesh Rao', 'Vimal Raj',
  'Sreekanth Nair', 'Gautham Pillai', 'Harikrishnan K', 'Dhanush Mohan',
];

export const DEMO_PLAYERS: Player[] = DEMO_NAMES.map((name, index) => {
  const categoryId =
    index < 16 ? 'blue' : index < 52 ? 'orange' : 'yellow';
  return {
    id: `demo-p-${index + 1}`,
    name,
    categoryId,
    club: 'Demo Entrant',
    isDemo: true,
  };
});

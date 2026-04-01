import { SusuGroup } from './types';

export const INITIAL_GROUPS: SusuGroup[] = [
  {
    id: 'group-1',
    name: 'Susu Circle 02',
    dailyContribution: 21,
    adminFee: 140, 
    maxMembers: 20,
    durationInWeeks: 20,
    paymentFrequency: 'daily',
    contributionSchedule: 'all_days',
    daysPerCycle: 7,
    cashOutAmount: 2800,
    momoDetails: '0209489849 - Sung Shmair Mumuni',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    members: [
      { id: 'm1', name: 'Safia', position: 1, daysPaid: 2, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm2', name: 'MI', position: 2, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm3', name: 'KiNgStar', position: 3, daysPaid: 6, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm4', name: 'S. Rahima', position: 4, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm5', name: 'Good', position: 5, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm6', name: 'Nana Yaw Kelvin', position: 6, daysPaid: 7, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm7', name: 'Faiz', position: 7, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm8', name: 'Ceasey', position: 8, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm9', name: 'Dodoo Aziz', position: 9, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm10', name: 'Rashida', position: 10, daysPaid: 7, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm11', name: 'Nba Asare', position: 11, daysPaid: 1, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm12', name: 'Rahina', position: 12, daysPaid: 2, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm13', name: 'Mualim Azaa', position: 13, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm14', name: 'BushDee', position: 14, daysPaid: 7, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm15', name: 'Gen', position: 15, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm16', name: 'Nba Abudi', position: 16, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm17', name: 'Augustine', position: 17, daysPaid: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm18', name: 'Oli', position: 18, daysPaid: 2, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm19', name: 'Nafi', position: 19, daysPaid: 3, hasCashedOut: false, joinDate: new Date().toISOString() },
      { id: 'm20', name: 'Najat', position: 20, daysPaid: 3, hasCashedOut: false, joinDate: new Date().toISOString() },
    ]
  }
];

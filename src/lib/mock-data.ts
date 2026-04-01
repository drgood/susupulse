import { SusuGroup } from './types';

export const INITIAL_GROUPS: SusuGroup[] = [
  {
    id: 'group-1',
    name: 'Entrepreneurs Alpha',
    dailyContribution: 50,
    adminFee: 100,
    maxMembers: 12,
    durationInDays: 30,
    paymentFrequency: 'daily',
    cashOutAmount: 550,
    momoDetails: '0241234567 - John Doe',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    members: [
      { id: 'm1', name: 'Alice Arhin', position: 1, daysPaid: 10, hasCashedOut: false, joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'm2', name: 'Bob Mensah', position: 2, daysPaid: 8, hasCashedOut: false, joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'm3', name: 'Charlie Koomson', position: 3, daysPaid: 10, hasCashedOut: true, joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'm4', name: 'Diana Osei', position: 4, daysPaid: 4, hasCashedOut: false, joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: 'group-2',
    name: 'Weekly Savers Club',
    dailyContribution: 20,
    adminFee: 50,
    maxMembers: 20,
    durationInDays: 60,
    paymentFrequency: 'weekly',
    cashOutAmount: 1100,
    momoDetails: '0559876543 - Jane Smith',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    members: [
      { id: 'm5', name: 'Edward Tetteh', position: 1, daysPaid: 28, hasCashedOut: false, joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'm6', name: 'Felicia Addo', position: 2, daysPaid: 14, hasCashedOut: false, joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  }
];
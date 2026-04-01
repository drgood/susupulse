export type PaymentFrequency = 'daily' | 'weekly';
export type ContributionSchedule = 'all_days' | 'weekdays_only';

export interface Member {
  id: string;
  name: string;
  position: number;
  daysPaid: number; // Cumulative days paid
  hasCashedOut: boolean;
  joinDate: string;
  lastPaymentDate?: string;
}

export interface SusuGroup {
  id: string;
  name: string;
  dailyContribution: number;
  feePerMark: number; // Your commission per member per day
  adminFee: number; // Total profit potential per cycle
  maxMembers: number;
  durationInWeeks: number; // Total cycles for a full rotation
  paymentFrequency: PaymentFrequency;
  contributionSchedule: ContributionSchedule;
  daysPerCycle: number; // How many marks (contribution days) per payout
  cashOutAmount: number;
  momoDetails: string;
  members: Member[];
  startDate: string; // The date the first cycle began
  createdAt: string;
}

export interface GlobalStats {
  totalMembers: number;
  totalCollected: number;
  adminProfit: number;
  defaulterCount: number;
}

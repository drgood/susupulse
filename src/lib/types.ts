export type PaymentFrequency = 'daily' | 'weekly';

export interface Member {
  id: string;
  name: string;
  position: number;
  daysPaid: number; // Cumulative days paid in current cycle
  hasCashedOut: boolean;
  joinDate: string;
  lastPaymentDate?: string;
}

export interface SusuGroup {
  id: string;
  name: string;
  dailyContribution: number;
  adminFee: number;
  maxMembers: number;
  durationInWeeks: number; // Total weeks for a full rotation
  paymentFrequency: PaymentFrequency;
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

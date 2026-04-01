export type PaymentFrequency = 'daily' | 'weekly';

export interface Member {
  id: string;
  name: string;
  position: number;
  daysPaid: number;
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
  durationInDays: number;
  paymentFrequency: PaymentFrequency;
  cashOutAmount: number;
  momoDetails: string;
  members: Member[];
  createdAt: string;
}

export interface GlobalStats {
  totalMembers: number;
  totalCollected: number;
  adminProfit: number;
  defaulterCount: number;
}
import { Users, Landmark, PiggyBank, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GlobalStats } from '@/lib/types';

export function StatsGrid({ stats }: { stats: GlobalStats }) {
  const items = [
    { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-blue-500' },
    { label: 'Collected Funds', value: `GH₵ ${stats.totalCollected.toLocaleString()}`, icon: PiggyBank, color: 'text-primary' },
    { label: 'Admin Profit', value: `GH₵ ${stats.adminProfit.toLocaleString()}`, icon: Landmark, color: 'text-accent' },
    { label: 'Defaulters', value: stats.defaulterCount, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <Card key={idx} className="border-none shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
            <div className="text-xl font-bold mt-1">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
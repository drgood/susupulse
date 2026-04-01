import { SusuGroup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function GroupSummary({ group }: { group: SusuGroup }) {
  const totalCollected = group.members.reduce((acc, m) => acc + (m.daysPaid * group.dailyContribution), 0);
  const totalProfit = group.members.length * group.adminFee;
  const poolSize = group.members.length * group.dailyContribution * group.durationInDays;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Expected Pool</p>
            <p className="text-lg font-bold">GH₵ {poolSize.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Admin Profit</p>
            <p className="text-lg font-bold text-accent">GH₵ {totalProfit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Collected</p>
            <p className="text-lg font-bold text-primary">GH₵ {totalCollected.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Cash-out Set</p>
            <p className="text-lg font-bold">GH₵ {group.cashOutAmount.toLocaleString()}</p>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Payment Frequency</span>
          <span className="font-semibold capitalize">{group.paymentFrequency}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Contribution Rate</span>
          <span className="font-semibold">GH₵ {group.dailyContribution} / day</span>
        </div>
      </CardContent>
    </Card>
  );
}
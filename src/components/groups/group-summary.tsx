'use client';

import { SusuGroup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, Wallet, Info } from 'lucide-react';
import { differenceInCalendarDays, isWeekend } from 'date-fns';

export function GroupSummary({ group }: { group: SusuGroup }) {
  // Logic to calculate active days passed
  const calculateActiveDaysPassed = () => {
    const now = new Date();
    const start = new Date(group.startDate);
    const totalDays = Math.max(0, differenceInCalendarDays(now, start));
    
    if (group.contributionSchedule === 'all_days') return totalDays;
    
    // Count only weekdays
    let activeDays = 0;
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (!isWeekend(d)) activeDays++;
    }
    return activeDays;
  };

  const activeDaysPassed = calculateActiveDaysPassed();
  const currentCycleIndex = Math.floor(activeDaysPassed / group.daysPerCycle);
  const currentRecipient = group.members.find(m => m.position === (currentCycleIndex + 1)) || group.members[0];
  
  const totalCollectedSoFar = group.members.reduce((acc, m) => acc + (m.daysPaid * group.dailyContribution), 0);

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Group Pulse</CardTitle>
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none">
          Cycle {currentCycleIndex + 1} of {group.durationInWeeks}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Current Recipient</p>
            <h3 className="text-xl font-black">{currentRecipient?.name}</h3>
            <p className="text-xs text-muted-foreground">Pot: GH¢ {group.cashOutAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Wallet className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Collection</span>
            </div>
            <p className="text-2xl font-black text-primary leading-none">
              GH¢ {totalCollectedSoFar.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cycle Profit</span>
            </div>
            <p className="text-2xl font-black text-accent leading-none">
              GH¢ {group.adminFee.toLocaleString()}
            </p>
          </div>
        </div>
        
        <Separator className="bg-muted" />
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Schedule</span>
            <span className="font-bold">{group.contributionSchedule === 'all_days' ? 'Mon-Sun' : 'Mon-Fri'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Payout Interval</span>
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
              Every {group.daysPerCycle} active marks
            </Badge>
          </div>
          <div className="flex items-start gap-2 mt-2 p-2 bg-muted/30 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Recipients rotate every {group.daysPerCycle} marks. Current position: {currentCycleIndex + 1}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

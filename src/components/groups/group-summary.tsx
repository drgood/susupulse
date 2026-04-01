'use client';

import { SusuGroup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, Wallet } from 'lucide-react';
import { differenceInWeeks } from 'date-fns';

export function GroupSummary({ group }: { group: SusuGroup }) {
  // Calculate current week based on start date
  const now = new Date();
  const start = new Date(group.startDate);
  const currentWeekIndex = Math.max(0, differenceInWeeks(now, start));
  
  // Rotating recipient based on position
  const currentRecipient = group.members.find(m => m.position === (currentWeekIndex + 1)) || group.members[0];
  
  const weeklyCollection = group.maxMembers * group.dailyContribution * 7;
  const totalCollectedSoFar = group.members.reduce((acc, m) => acc + (m.daysPaid * group.dailyContribution), 0);

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Group Pulse</CardTitle>
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none">
          Week {currentWeekIndex + 1} of {group.durationInWeeks}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Weekly Recipient</p>
            <h3 className="text-xl font-black">{currentRecipient?.name}</h3>
            <p className="text-xs text-muted-foreground">Due: GH¢ {group.cashOutAmount.toLocaleString()} this Sunday</p>
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
              <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Profit</span>
            </div>
            <p className="text-2xl font-black text-accent leading-none">
              GH¢ {group.adminFee.toLocaleString()}
            </p>
          </div>
        </div>
        
        <Separator className="bg-muted" />
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Daily Contribution</span>
            <span className="font-bold">GH¢ {group.dailyContribution}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Payment Rule</span>
            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">Weekly due Sunday 5PM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

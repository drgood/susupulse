'use client';

import { useState } from 'react';
import { SusuGroup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, Wallet, Info, TrendingUp, Users, Landmark, RefreshCw, CheckCircle } from 'lucide-react';
import { calculateActiveDaysPassed, getWeeklyFrequency, completeCycle, getCycleStats, isCycleComplete } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';

export function GroupSummary({ group, onCycleComplete }: { group: SusuGroup, onCycleComplete?: () => void }) {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const activeDaysPassed = calculateActiveDaysPassed(group);
  const currentCycleIndex = Math.floor(activeDaysPassed / group.daysPerCycle);
  const recipientsPerCycle = group.recipientsPerCycle || 1;
  
  const currentRecipient = group.members.find(m => m.position === (currentCycleIndex + 1));
  
  const cycleStats = getCycleStats(group);
  const cycleComplete = isCycleComplete(group);
  
  const weeklyFrequency = getWeeklyFrequency(group);
  const weeklyCollectionPotential = group.dailyContribution * group.maxMembers * weeklyFrequency;

  const scheduleLabel = group.contributionSchedule === 'all_days' 
    ? 'Mon-Sun' 
    : group.contributionSchedule === 'weekdays_only' 
    ? 'Mon-Fri' 
    : `${weeklyFrequency} days/week`;

  const rotation = group.currentRotation || 1;
  const canCompleteCycle = cycleComplete;

  const handleCompleteCycle = async () => {
    try {
      const result = completeCycle(group);
      await db.groups.update(group.id, {
        members: result.members,
        currentRotation: result.newRotation,
        startDate: result.newStartDate
      });
      setIsConfirmOpen(false);
      toast({
        title: "Cycle Complete!",
        description: `Rotation ${rotation} ended. Starting Rotation ${result.newRotation}.`,
      });
      onCycleComplete?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete cycle.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Group Pulse</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full bg-accent/10 text-accent border-none">
              Round {rotation}
            </Badge>
            <Button
              variant={canCompleteCycle ? "default" : "outline"}
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!canCompleteCycle}
              className="h-7 text-[10px] px-2 rounded-full font-bold"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              End Round
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Award className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Current Recipient</p>
              <h3 className="text-xl font-black">{currentRecipient?.name || 'End of Rotation'}</h3>
              <p className="text-xs text-muted-foreground">Pot: GH¢ {group.cashOutAmount.toLocaleString()}</p>
            </div>
            {cycleComplete ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Badge variant="outline" className="rounded-full border-accent/30 text-accent bg-accent/5">
                {cycleStats.cashedOutCount}/{recipientsPerCycle} cashed
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Wallet className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-wider">Total Collection</span>
              </div>
              <p className="text-xl font-black text-primary leading-none">
                GH¢ {cycleStats.totalCollectedThisCycle.toLocaleString()}
              </p>
            </div>
            <div className="bg-accent/5 p-3 rounded-xl border border-accent/10">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-wider">Admin Profit</span>
              </div>
              <p className="text-xl font-black text-accent leading-none">
                GH¢ {cycleStats.adminProfitThisCycle.toLocaleString()}
              </p>
            </div>
          </div>
          
          <Separator className="bg-muted" />
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider px-1">Circle Configuration</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule
                </span>
                <span className="font-bold">{scheduleLabel}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Daily Amount
                </span>
                <span className="font-bold text-primary">GH¢ {group.dailyContribution}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Landmark className="h-4 w-4" /> Admin Fee
                </span>
                <span className="font-bold text-accent">GH¢ {group.feePerMark} / day</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Capacity
                </span>
                <span className="font-bold">{group.maxMembers} Members</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Profit is tracked per payment mark. Current collection potential is <span className="font-bold text-primary">GH¢ {weeklyCollectionPotential.toLocaleString()}</span> per week.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>End Rotation {rotation}?</DialogTitle>
            <DialogDescription>
              This will reset all members' payment progress and start a new rotation.
              <br /><br />
              {cycleStats.cashedOutCount} recipient(s) cashed out this round.
              <br />
              Total collected: GH¢{cycleStats.totalCollectedThisCycle.toLocaleString()}
              <br />
              Admin profit: GH¢{cycleStats.adminProfitThisCycle.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteCycle}>Confirm & Start Round {rotation + 1}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { SusuGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Users, CheckCircle2, AlertCircle, TrendingUp, User, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { differenceInCalendarDays, isWeekend } from 'date-fns';
import { useState, useMemo } from 'react';

interface CircleSwitcherProps {
  groups: SusuGroup[];
  activeGroupId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onLock: () => void;
}

export function CircleSwitcher({ groups, activeGroupId, onSelect, onCreate, onLock }: CircleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const getGroupAnalytics = (group: SusuGroup) => {
    const now = new Date();
    const start = new Date(group.startDate);
    const totalDays = Math.max(0, differenceInCalendarDays(now, start));
    let activeDaysPassed = 0;
    
    if (group.contributionSchedule === 'all_days') {
      activeDaysPassed = totalDays;
    } else {
      for (let i = 0; i <= totalDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (!isWeekend(d)) activeDaysPassed++;
      }
    }

    const currentCycleIndex = Math.floor(activeDaysPassed / group.daysPerCycle);
    const targetMarks = (currentCycleIndex + 1) * group.daysPerCycle;

    const defaulters = group.members.filter(m => m.daysPaid < targetMarks && !m.hasCashedOut).length;
    const currentRecipient = group.members.find(m => m.position === (currentCycleIndex + 1));
    
    return { defaulters, currentRecipient, currentCycleIndex };
  };

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const statsA = getGroupAnalytics(a);
      const statsB = getGroupAnalytics(b);
      // Priority 1: Defaulters
      if (statsB.defaulters !== statsA.defaulters) {
        return statsB.defaulters - statsA.defaulters;
      }
      return 0;
    });
  }, [groups]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 group text-left">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-foreground tracking-tight leading-none">
                {activeGroup?.name || 'Select Circle'}
              </span>
              <ChevronDown className="h-5 w-5 text-primary group-hover:translate-y-0.5 transition-transform" />
              {activeGroup && getGroupAnalytics(activeGroup).defaulters > 0 && (
                <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              )}
            </div>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0 flex flex-col border-r-primary/10">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black italic text-primary">Your Circles</SheetTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-muted-foreground/20">
              {groups.length} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Master Management Strategy</p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {sortedGroups.map((group) => {
            const { defaulters, currentRecipient } = getGroupAnalytics(group);
            const isActive = activeGroupId === group.id;

            return (
              <button
                key={group.id}
                onClick={() => {
                  onSelect(group.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4",
                  isActive 
                    ? "bg-primary/5 border-primary/20 shadow-sm" 
                    : "bg-white border-transparent hover:bg-secondary/50 border-border/50"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Users className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-bold text-sm truncate pr-2",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {group.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {defaulters === 0 ? (
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> All Paid
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tighter flex items-center gap-1",
                        defaulters > 2 ? "text-red-500" : "text-amber-500"
                      )}>
                        <AlertCircle className="h-3 w-3" /> {defaulters} {defaulters > 2 ? 'Defaults' : 'Pending'}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-bold border-l pl-2 border-muted/50">
                      GH¢{group.dailyContribution}/day
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg">
                    <User className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                      Next Payout: <span className="font-bold text-foreground">{currentRecipient?.name || 'End of Circle'}</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 mt-auto bg-muted/10 border-t border-primary/5 space-y-3">
          <Button 
            className="w-full rounded-xl h-12 font-bold gap-2 shadow-lg shadow-primary/10"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
          >
            <Plus className="h-5 w-5" />
            Create New Circle
          </Button>
          <Button 
            variant="outline"
            className="w-full rounded-xl h-12 font-bold gap-2 border-primary/20 text-muted-foreground hover:text-primary transition-all"
            onClick={() => {
              setOpen(false);
              onLock();
            }}
          >
            <LogOut className="h-4 w-4" />
            Log Out & Lock
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

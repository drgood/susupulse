'use client';

import { SusuGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Users, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { useState } from 'react';

interface CircleSwitcherProps {
  groups: SusuGroup[];
  activeGroupId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function CircleSwitcher({ groups, activeGroupId, onSelect, onCreate }: CircleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const getGroupHealth = (group: SusuGroup) => {
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
    return defaulters;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 group">
          <span className="text-xl font-black text-foreground tracking-tight">
            {activeGroup?.name}
          </span>
          <ChevronDown className="h-5 w-5 text-primary group-hover:translate-y-0.5 transition-transform" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[380px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-black italic text-primary">Your Circles</SheetTitle>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Master Management Book</p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {groups.map((group) => {
            const defaulters = getGroupHealth(group);
            const isActive = activeGroupId === group.id;

            return (
              <button
                key={group.id}
                onClick={() => {
                  onSelect(group.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2",
                  isActive 
                    ? "bg-primary/5 border-primary/20 shadow-sm" 
                    : "bg-white border-transparent hover:bg-secondary"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-bold text-sm",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {group.name}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                    <Users className="h-3 w-3" />
                    {group.members.length}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {defaulters === 0 ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] py-0 h-5 px-2 rounded-full font-black uppercase">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      All Caught Up
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] py-0 h-5 px-2 rounded-full font-black uppercase">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {defaulters} Behind
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground font-bold">
                    GH¢{group.dailyContribution}/day
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 mt-auto bg-muted/30 border-t">
          <Button 
            className="w-full rounded-xl h-12 font-bold gap-2"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
          >
            <Plus className="h-5 w-5" />
            Create New Circle
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { GroupTabs } from '@/components/dashboard/group-tabs';
import { GroupSummary } from '@/components/groups/group-summary';
import { MemberTracking } from '@/components/members/member-tracking';
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel';
import { CreateGroupForm } from '@/components/groups/create-group-form';
import { INITIAL_GROUPS } from '@/lib/mock-data';
import { SusuGroup, GlobalStats, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Search, Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { differenceInCalendarDays, isWeekend } from 'date-fns';

export default function Dashboard() {
  const [groups, setGroups] = useState<SusuGroup[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeGroup = useMemo(() => 
    groups.find(g => g.id === activeGroupId) || groups[0], 
    [groups, activeGroupId]
  );

  const globalStats = useMemo<GlobalStats>(() => {
    let totalMembers = 0;
    let totalCollected = 0;
    let adminProfit = 0;
    let defaulterCount = 0;

    const now = new Date();

    groups.forEach(g => {
      totalMembers += g.members.length;
      
      // Calculate active days passed to determine target marks
      const start = new Date(g.startDate);
      const totalDays = Math.max(0, differenceInCalendarDays(now, start));
      let activeDaysPassed = 0;
      if (g.contributionSchedule === 'all_days') {
        activeDaysPassed = totalDays;
      } else {
        for (let i = 0; i <= totalDays; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          if (!isWeekend(d)) activeDaysPassed++;
        }
      }

      // Expected marks for everyone up to now
      const targetMarks = activeDaysPassed;

      g.members.forEach(m => {
        totalCollected += m.daysPaid * g.dailyContribution;
        if (m.daysPaid < targetMarks && !m.hasCashedOut) defaulterCount++;
      });
      
      // Admin profit is based on cycles completed
      const completedCycles = Math.floor(activeDaysPassed / g.daysPerCycle);
      adminProfit += completedCycles * g.adminFee;
    });

    return { totalMembers, totalCollected, adminProfit, defaulterCount };
  }, [groups]);

  const updateMember = (memberId: string, updates: Partial<Member>) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== activeGroupId) return g;
      return {
        ...g,
        members: g.members.map(m => m.id === memberId ? { ...m, ...updates } : m)
      };
    }));
  };

  const handleCreateGroup = (newGroup: SusuGroup) => {
    setGroups([...groups, newGroup]);
    setActiveGroupId(newGroup.id);
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-body pb-12">
      <header className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight italic">SusuPulse</h1>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Master Admin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-none shadow-sm bg-white">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-none shadow-sm bg-white relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white"></span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-none shadow-sm bg-white">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="px-5 space-y-6 max-w-2xl mx-auto">
        <div className="space-y-3">
          <StatsGrid stats={globalStats} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Active Circles</h2>
          </div>
          <GroupTabs 
            groups={groups} 
            activeGroupId={activeGroupId} 
            onSelect={setActiveGroupId} 
            onCreate={() => setIsCreateOpen(true)}
          />
        </div>

        {activeGroup && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GroupSummary group={activeGroup} />
            
            <AIInsightsPanel group={activeGroup} />
            
            <MemberTracking 
              group={activeGroup} 
              onUpdateMember={updateMember} 
            />

            <div className="pt-4 flex justify-center">
               <Button variant="secondary" className="w-full h-12 rounded-xl border border-primary/10 flex items-center gap-2 font-bold">
                 <Plus className="h-5 w-5" />
                 Add Member to {activeGroup.name}
               </Button>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogTitle className="sr-only">Create New Susu Circle</DialogTitle>
          <CreateGroupForm 
            onSubmit={handleCreateGroup} 
            onCancel={() => setIsCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

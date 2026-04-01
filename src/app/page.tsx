'use client';

import { useState, useMemo } from 'react';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { GroupTabs } from '@/components/dashboard/group-tabs';
import { GroupSummary } from '@/components/groups/group-summary';
import { MemberTracking } from '@/components/members/member-tracking';
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel';
import { CreateGroupForm } from '@/components/groups/create-group-form';
import { WhatsAppShare } from '@/components/share/whatsapp-share';
import { GroupSettings } from '@/components/groups/group-settings';
import { INITIAL_GROUPS } from '@/lib/mock-data';
import { SusuGroup, GlobalStats, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Search, Settings, Users, BarChart3, Share2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInCalendarDays, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [groups, setGroups] = useState<SusuGroup[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

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

      const currentCycleIndex = Math.floor(activeDaysPassed / g.daysPerCycle);
      const targetMarks = (currentCycleIndex + 1) * g.daysPerCycle;

      g.members.forEach(m => {
        totalCollected += m.daysPaid * g.dailyContribution;
        if (m.daysPaid < targetMarks && !m.hasCashedOut) defaulterCount++;
      });
      
      adminProfit += currentCycleIndex * g.adminFee;
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

  const updateGroup = (groupId: string, updates: Partial<SusuGroup>) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const deleteGroup = (groupId: string) => {
    if (groups.length <= 1) return;
    const newGroups = groups.filter(g => g.id !== groupId);
    setGroups(newGroups);
    setActiveGroupId(newGroups[0].id);
  };

  const handleCreateGroup = (newGroup: SusuGroup) => {
    setGroups([...groups, newGroup]);
    setActiveGroupId(newGroup.id);
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-body pb-20">
      <header className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight italic">SusuPulse</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Master Admin Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-none shadow-sm bg-white">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-none shadow-sm bg-white relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </header>

      <main className="px-5 space-y-6 max-w-2xl mx-auto">
        <StatsGrid stats={globalStats} />

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Circles</h2>
          </div>
          <GroupTabs 
            groups={groups} 
            activeGroupId={activeGroupId} 
            onSelect={setActiveGroupId} 
            onCreate={() => setIsCreateOpen(true)}
          />
        </div>

        {activeGroup && (
          <div className="space-y-6">
            <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-12 p-1 bg-white border border-border rounded-xl">
                <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Members</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="share" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Share2 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Share</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Settings</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-6">
                <TabsContent value="members" className="space-y-6 m-0 outline-none">
                  <AIInsightsPanel group={activeGroup} />
                  <MemberTracking 
                    group={activeGroup} 
                    onUpdateMember={updateMember} 
                  />
                </TabsContent>

                <TabsContent value="summary" className="m-0 outline-none">
                  <GroupSummary group={activeGroup} />
                </TabsContent>

                <TabsContent value="share" className="m-0 outline-none">
                  <WhatsAppShare group={activeGroup} />
                </TabsContent>

                <TabsContent value="settings" className="m-0 outline-none">
                  <GroupSettings 
                    group={activeGroup} 
                    onUpdateGroup={(updates) => updateGroup(activeGroup.id, updates)}
                    onDeleteGroup={() => deleteGroup(activeGroup.id)}
                  />
                </TabsContent>
              </div>
            </Tabs>
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

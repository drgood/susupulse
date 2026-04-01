'use client';

import { useState, useMemo } from 'react';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { CircleSwitcher } from '@/components/dashboard/circle-switcher';
import { GlobalSearch } from '@/components/dashboard/global-search';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import { GroupSummary } from '@/components/groups/group-summary';
import { MemberTracking } from '@/components/members/member-tracking';
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel';
import { CreateGroupForm } from '@/components/groups/create-group-form';
import { WhatsAppShare } from '@/components/share/whatsapp-share';
import { GroupSettings } from '@/components/groups/group-settings';
import { INITIAL_GROUPS } from '@/lib/mock-data';
import { SusuGroup, GlobalStats, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bell, Search, Settings, Users, BarChart3, Share2, Activity } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { differenceInCalendarDays, isWeekend } from 'date-fns';

export default function Dashboard() {
  const [groups, setGroups] = useState<SusuGroup[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  const activeGroup = useMemo(() => 
    groups.find(g => g.id === activeGroupId) || groups[0], 
    [groups, activeGroupId]
  );

  const activeGroupProgress = useMemo(() => {
    if (!activeGroup) return 0;
    const now = new Date();
    const start = new Date(activeGroup.startDate);
    const totalDays = Math.max(0, differenceInCalendarDays(now, start));
    let activeDaysPassed = 0;
    if (activeGroup.contributionSchedule === 'all_days') {
      activeDaysPassed = totalDays;
    } else {
      for (let i = 0; i <= totalDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (!isWeekend(d)) activeDaysPassed++;
      }
    }
    const daysInCurrentCycle = activeDaysPassed % activeGroup.daysPerCycle;
    return (daysInCurrentCycle / activeGroup.daysPerCycle) * 100;
  }, [activeGroup]);

  const activeGroupCycleDay = useMemo(() => {
    if (!activeGroup) return 0;
    const now = new Date();
    const start = new Date(activeGroup.startDate);
    const totalDays = Math.max(0, differenceInCalendarDays(now, start));
    let activeDaysPassed = 0;
    if (activeGroup.contributionSchedule === 'all_days') {
      activeDaysPassed = totalDays;
    } else {
      for (let i = 0; i <= totalDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (!isWeekend(d)) activeDaysPassed++;
      }
    }
    return (activeDaysPassed % activeGroup.daysPerCycle) + 1;
  }, [activeGroup]);

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
        adminProfit += m.daysPaid * (g.feePerMark || 1);
        if (m.daysPaid < targetMarks && !m.hasCashedOut) defaulterCount++;
      });
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
      <header className="px-5 pt-8 pb-6 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-primary/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic mb-1">SusuPulse</h1>
            <CircleSwitcher 
              groups={groups} 
              activeGroupId={activeGroupId} 
              onSelect={setActiveGroupId} 
              onCreate={() => setIsCreateOpen(true)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-10 w-10 border-none shadow-sm bg-white hover:bg-primary/5 transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-10 w-10 border-none shadow-sm bg-white relative hover:bg-primary/5 transition-colors"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {globalStats.defaulterCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </Button>
          </div>
        </div>

        {activeGroup && (
          <div className="max-w-2xl mx-auto px-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-500">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3 text-primary" />
                Cycle Progress
              </span>
              <span className="text-primary">Day {activeGroupCycleDay} of {activeGroup.daysPerCycle}</span>
            </div>
            <Progress value={activeGroupProgress} className="h-1 bg-primary/10 rounded-full" />
          </div>
        )}
      </header>

      <main className="px-5 space-y-6 max-w-2xl mx-auto mt-6">
        <StatsGrid stats={globalStats} />

        {activeGroup && (
          <div className="space-y-6">
            <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-12 p-1.5 bg-white border border-border/50 rounded-2xl shadow-sm">
                <TabsTrigger value="members" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Members</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="share" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                  <Share2 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Share</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 border-none shadow-2xl">
          <DialogTitle className="sr-only">Create New Susu Circle</DialogTitle>
          <CreateGroupForm 
            onSubmit={handleCreateGroup} 
            onCancel={() => setIsCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        groups={groups}
        onSelectMember={(groupId) => {
          setActiveGroupId(groupId);
          setIsSearchOpen(false);
        }}
      />

      <NotificationsPanel 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        groups={groups}
        onSelectGroup={(id) => {
          setActiveGroupId(id);
          setIsNotificationsOpen(false);
        }}
      />

      <Toaster />
    </div>
  );
}

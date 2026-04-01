'use client';

import { useState, useMemo } from 'react';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { GroupTabs } from '@/components/dashboard/group-tabs';
import { GroupSummary } from '@/components/groups/group-summary';
import { MemberTracking } from '@/components/members/member-tracking';
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel';
import { INITIAL_GROUPS } from '@/lib/mock-data';
import { SusuGroup, GlobalStats, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Search, Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function Dashboard() {
  const [groups, setGroups] = useState<SusuGroup[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);

  const activeGroup = useMemo(() => 
    groups.find(g => g.id === activeGroupId) || groups[0], 
    [groups, activeGroupId]
  );

  const globalStats = useMemo<GlobalStats>(() => {
    let totalMembers = 0;
    let totalCollected = 0;
    let adminProfit = 0;
    let defaulterCount = 0;

    groups.forEach(g => {
      totalMembers += g.members.length;
      adminProfit += g.members.length * g.adminFee;
      g.members.forEach(m => {
        totalCollected += m.daysPaid * g.dailyContribution;
        // Simple logic for defaulter count for the dashboard
        if (m.daysPaid < 5 && !m.hasCashedOut) defaulterCount++;
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

  const handleCreateGroup = () => {
    // Logic for new group dialog would go here
    const newId = `group-${Date.now()}`;
    const newGroup: SusuGroup = {
      id: newId,
      name: 'New Susu Circle',
      dailyContribution: 20,
      adminFee: 20,
      maxMembers: 10,
      durationInDays: 30,
      paymentFrequency: 'daily',
      cashOutAmount: 200,
      momoDetails: 'N/A',
      createdAt: new Date().toISOString(),
      members: [
        { id: `m-${Date.now()}`, name: 'Group Admin', position: 1, daysPaid: 1, hasCashedOut: false, joinDate: new Date().toISOString() }
      ]
    };
    setGroups([...groups, newGroup]);
    setActiveGroupId(newId);
  };

  return (
    <div className="min-h-screen bg-background font-body pb-12">
      <header className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">SusuPulse</h1>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Administrator</p>
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
        {/* Global Overview */}
        <div className="space-y-3">
          <StatsGrid stats={globalStats} />
        </div>

        {/* Group Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Active Groups</h2>
          </div>
          <GroupTabs 
            groups={groups} 
            activeGroupId={activeGroupId} 
            onSelect={setActiveGroupId} 
            onCreate={handleCreateGroup}
          />
        </div>

        {/* Active Group Content */}
        {activeGroup && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GroupSummary group={activeGroup} />
            
            <AIInsightsPanel group={activeGroup} />
            
            <MemberTracking 
              group={activeGroup} 
              onUpdateMember={updateMember} 
            />

            <div className="pt-4 flex justify-center">
               <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                 <Plus className="h-5 w-5" />
                 Add New Member
               </Button>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}
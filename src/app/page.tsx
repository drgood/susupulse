"use client";

import { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { CircleSwitcher } from "@/components/dashboard/circle-switcher";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { GroupSummary } from "@/components/groups/group-summary";
import { MemberTracking } from "@/components/members/member-tracking";

import { CreateGroupForm } from "@/components/groups/create-group-form";
import { WhatsAppShare } from "@/components/share/whatsapp-share";
import { GroupSettings } from "@/components/groups/group-settings";
import { PinLogin } from "@/components/auth/pin-login";
import { SusuGroup, GlobalStats, Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Search,
  Settings,
  Users,
  BarChart3,
  Share2,
  Activity,
  Loader2,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { calculateActiveDaysPassed } from "@/lib/utils";

export default function Dashboard() {
  const groupsRaw = useLiveQuery(() => db.groups.toArray());
  const isLoading = groupsRaw === undefined;
  const groups = groupsRaw || [];
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSeedLiveData = async () => {
    const liveGroup1 = {
      id: crypto.randomUUID(),
      name: "20 people cash out 💵 GH¢2800",
      dailyContribution: 21,
      feePerMark: 1,
      adminFee: 140, 
      maxMembers: 20,
      durationInWeeks: 20,
      paymentFrequency: "daily" as const,
      contributionSchedule: "all_days" as const,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      daysPerCycle: 7,
      cashOutAmount: 2800,
      momoNumber: "0209489849",
      momoName: "Sung Shmair Mumuni",
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      members: [
        { id: crypto.randomUUID(), name: "Safia", position: 1, daysPaid: 5, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "MI", position: 2, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "KiNgStar", position: 3, daysPaid: 6, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "S. Rahima", position: 4, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Good", position: 5, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Nana Yaw Kelvin", position: 6, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Faiz", position: 7, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Ceasey", position: 8, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Dodoo Aziz", position: 9, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Rashida", position: 10, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Nba Asare", position: 11, daysPaid: 1, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Rahina", position: 12, daysPaid: 2, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Mualim Azaa", position: 13, daysPaid: 5, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "BushDee", position: 14, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Gen", position: 15, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Nba Abudi", position: 16, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Augustine", position: 17, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Oli", position: 18, daysPaid: 5, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Nafi", position: 19, daysPaid: 3, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Najat", position: 20, daysPaid: 5, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() }
      ]
    };

    const liveGroup2 = {
      id: crypto.randomUUID(),
      name: "11 people cash out 💵 GH¢1500",
      dailyContribution: 21,
      feePerMark: 1.5, // 21 * 7 = 147 weekly per person. 11 people * 147 = 1617 total pool. 1617 - 1500 = 117 admin fee per cycle. 117 / 11 members / 7 days = ~1.5 fee per mark
      adminFee: 117,
      maxMembers: 11,
      durationInWeeks: 11,
      paymentFrequency: "daily" as const,
      contributionSchedule: "all_days" as const,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      daysPerCycle: 7,
      cashOutAmount: 1500,
      momoNumber: "0209489849",
      momoName: "Sung Shmair Mumuni",
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      members: [
        { id: crypto.randomUUID(), name: "Nuura", position: 1, daysPaid: 6, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "SM", position: 2, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "MI", position: 3, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Ahmed Jakalia", position: 4, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Murzuk", position: 5, daysPaid: 1, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Mueena", position: 6, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "General", position: 7, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Princess Shaggy", position: 8, daysPaid: 7, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Daudifuziemata", position: 9, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Abdul Mujeeb", position: 10, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Abdul Aziz", position: 11, daysPaid: 0, creditRemainder: 0, hasCashedOut: false, joinDate: new Date().toISOString() }
      ]
    };
    
    await db.groups.bulkAdd([liveGroup1, liveGroup2]);
    setActiveGroupId(liveGroup1.id);
  };

  // Set default active group once groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups, activeGroupId]);

  const activeGroup = useMemo(
    () =>
      groups.find((g) => g.id === activeGroupId) ||
      (groups.length > 0 ? groups[0] : null),
    [groups, activeGroupId],
  );

  const activeGroupProgress = useMemo(() => {
    if (!activeGroup) return 0;
    const activeDaysPassed = calculateActiveDaysPassed(activeGroup);
    const daysInCurrentCycle = activeDaysPassed % activeGroup.daysPerCycle;
    return (daysInCurrentCycle / activeGroup.daysPerCycle) * 100;
  }, [activeGroup]);

  const activeGroupCycleDay = useMemo(() => {
    if (!activeGroup) return 0;
    const activeDaysPassed = calculateActiveDaysPassed(activeGroup);
    return (activeDaysPassed % activeGroup.daysPerCycle) + 1;
  }, [activeGroup]);

  const globalStats = useMemo<GlobalStats>(() => {
    let totalMembers = 0;
    let totalCollected = 0;
    let adminProfit = 0;
    let defaulterCount = 0;

    groups.forEach((g) => {
      totalMembers += g.members.length;
      const activeDaysPassed = calculateActiveDaysPassed(g);
      const currentCycleIndex = Math.floor(activeDaysPassed / g.daysPerCycle);
      const targetMarks = (currentCycleIndex + 1) * g.daysPerCycle;

      g.members.forEach((m) => {
        totalCollected += m.daysPaid * g.dailyContribution;
        adminProfit += m.daysPaid * (g.feePerMark || 1);
        if (m.daysPaid < targetMarks && !m.hasCashedOut) defaulterCount++;
      });
    });

    return { totalMembers, totalCollected, adminProfit, defaulterCount };
  }, [groups]);

  const updateMember = async (memberId: string, updates: Partial<Member>) => {
    if (!activeGroupId || !activeGroup) return;
    const updatedMembers = activeGroup.members.map((m) =>
      m.id === memberId ? { ...m, ...updates } : m,
    );
    await db.groups.update(activeGroupId, { members: updatedMembers });
  };

  const updateGroup = async (groupId: string, updates: Partial<SusuGroup>) => {
    await db.groups.update(groupId, updates);
  };

  const deleteGroup = async (groupId: string) => {
    if (groups.length <= 1) return;
    await db.groups.delete(groupId);
    const remaining = groups.filter((g) => g.id !== groupId);
    if (remaining.length > 0) {
      setActiveGroupId(remaining[0].id);
    }
  };

  const handleCreateGroup = async (newGroup: SusuGroup) => {
    await db.groups.add(newGroup);
    setActiveGroupId(newGroup.id);
    setIsCreateOpen(false);
  };

  if (!isAuthenticated) {
    return <PinLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-primary italic">
            SusuPulse Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-5 font-body">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome to SusuPulse</h1>
            <p className="text-muted-foreground text-sm">You haven't created any Susu circles yet. Get started by creating your first group.</p>
          </div>
          <div className="w-full space-y-3">
            <Button onClick={() => setIsCreateOpen(true)} className="w-full rounded-2xl h-14 text-base font-bold shadow-lg">
              Create First Circle
            </Button>
            <Button onClick={handleSeedLiveData} variant="secondary" className="w-full rounded-2xl h-14 text-base font-bold shadow-sm border border-border/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
              ⚡ Seed Live Susu Groups (2)
            </Button>
          </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 border-none shadow-2xl">
                <DialogTitle className="sr-only">Create New Susu Circle</DialogTitle>
                <DialogDescription className="sr-only">Configure your new Susu circle.</DialogDescription>
                <CreateGroupForm
                  onSubmit={handleCreateGroup}
                  onCancel={() => setIsCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background font-body pb-20">
      <header className="px-5 pt-8 pb-6 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-primary/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic mb-1">
              SusuPulse
            </h1>
            <CircleSwitcher
              groups={groups}
              activeGroupId={activeGroupId || ""}
              onSelect={setActiveGroupId}
              onCreate={() => setIsCreateOpen(true)}
              onLock={() => setIsAuthenticated(false)}
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
              <span className="text-primary">
                Day {activeGroupCycleDay} of {activeGroup.daysPerCycle}
              </span>
            </div>
            <Progress
              value={activeGroupProgress}
              className="h-1 bg-primary/10 rounded-full"
            />
          </div>
        )}
      </header>

      <main className="px-5 space-y-6 max-w-2xl mx-auto mt-6">
        <StatsGrid stats={globalStats} />

        {activeGroup && (
          <div className="space-y-6">
            <Tabs
              defaultValue="members"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 h-12 p-1.5 bg-white border border-border/50 rounded-2xl shadow-sm">
                <TabsTrigger
                  value="members"
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Members
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Summary
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="share"
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Share
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Settings className="h-4 w-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Settings
                  </span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-6">
                <TabsContent
                  value="members"
                  className="space-y-6 m-0 outline-none"
                >
                  <MemberTracking
                    group={activeGroup}
                    onUpdateMember={updateMember}
                    onMembersUpdate={() => {}}
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
                    onUpdateGroup={(updates) =>
                      updateGroup(activeGroup.id, updates)
                    }
                    onDeleteGroup={() => deleteGroup(activeGroup.id)}
                    onLogout={() => setIsAuthenticated(false)}
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
          <DialogDescription className="sr-only">Configure your new Susu circle.</DialogDescription>
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

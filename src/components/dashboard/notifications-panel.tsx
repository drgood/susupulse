'use client';

import { SusuGroup } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertCircle, CheckCircle2, Wallet, Calendar, User } from 'lucide-react';
import { differenceInCalendarDays, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SusuGroup[];
  onSelectGroup: (groupId: string) => void;
}

export function NotificationsPanel({ isOpen, onClose, groups, onSelectGroup }: NotificationsPanelProps) {
  const alerts = groups.flatMap(group => {
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
    const currentRecipient = group.members.find(m => m.position === (currentCycleIndex + 1));

    const defaulters = group.members
      .filter(m => m.daysPaid < targetMarks && !m.hasCashedOut)
      .map(m => ({
        type: 'default' as const,
        title: 'Payment Overdue',
        description: `${m.name} is behind on their marks in ${group.name}.`,
        groupId: group.id,
        severity: 'high' as const
      }));

    const payoutAlert = currentRecipient && !currentRecipient.hasCashedOut ? [{
      type: 'payout' as const,
      title: 'Pending Payout',
      description: `${currentRecipient.name} is due for GH¢${group.cashOutAmount} in ${group.name}.`,
      groupId: group.id,
      severity: 'medium' as const
    }] : [];

    return [...defaulters, ...payoutAlert];
  }).sort((a, b) => (a.severity === 'high' ? -1 : 1));

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[320px] sm:w-[400px] p-0 flex flex-col border-l-primary/10">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black italic text-primary">Susu Alerts</SheetTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-muted-foreground/20">
              {alerts.length} Action Items
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Cross-Circle Intelligence</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-sm">All Pulse Clear</h3>
                <p className="text-xs text-muted-foreground">Every circle is operating within healthy parameters.</p>
              </div>
            </div>
          ) : (
            alerts.map((alert, i) => (
              <button
                key={i}
                onClick={() => onSelectGroup(alert.groupId)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4",
                  alert.type === 'default' 
                    ? "bg-red-50/50 border-red-100 hover:bg-red-50" 
                    : "bg-amber-50/50 border-amber-100 hover:bg-amber-50"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  alert.type === 'default' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                  {alert.type === 'default' ? <AlertCircle className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-bold text-sm",
                      alert.type === 'default' ? "text-red-700" : "text-amber-700"
                    )}>
                      {alert.title}
                    </span>
                    <Badge className={cn(
                      "text-[8px] uppercase px-1.5 border-none",
                      alert.severity === 'high' ? "bg-red-500" : "bg-amber-500"
                    )}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-6 mt-auto bg-muted/10 border-t border-primary/5">
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-border shadow-sm">
            <Calendar className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pulse Tip</p>
              <p className="text-xs font-medium text-foreground">Sharing a status update often resolves 80% of pending payments within 2 hours.</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

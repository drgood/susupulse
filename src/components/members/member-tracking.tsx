'use client';

import { SusuGroup, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Minus, Share2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays, isWeekend } from 'date-fns';

interface MemberTrackingProps {
  group: SusuGroup;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
}

export function MemberTracking({ group, onUpdateMember }: MemberTrackingProps) {
  const { toast } = useToast();

  const calculateActiveDaysPassed = () => {
    const now = new Date();
    const start = new Date(group.startDate);
    const totalDays = Math.max(0, differenceInCalendarDays(now, start));
    
    if (group.contributionSchedule === 'all_days') return totalDays;
    
    let activeDays = 0;
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (!isWeekend(d)) activeDays++;
    }
    return activeDays;
  };

  const activeDaysPassed = calculateActiveDaysPassed();
  const currentRecipientPosition = Math.floor(activeDaysPassed / group.daysPerCycle) + 1;

  const handleMarkPayment = (member: Member, delta: number) => {
    const newDays = Math.max(0, member.daysPaid + delta);
    onUpdateMember(member.id, { daysPaid: newDays, lastPaymentDate: new Date().toISOString() });
  };

  const handleToggleCashOut = (member: Member) => {
    onUpdateMember(member.id, { hasCashedOut: !member.hasCashedOut });
    toast({
      title: member.hasCashedOut ? "Reverted Cash Out" : "Confirmed Cash Out",
      description: `GH¢ ${group.cashOutAmount} payout recorded for ${member.name}.`,
    });
  };

  const copyStatusMessage = () => {
    const schedule = group.contributionSchedule === 'all_days' ? 'Mon-Sun' : 'Mon-Fri';
    const message = `SusuPulse: ${group.name} Status Update\n\n` +
      `📌 Daily: GH¢${group.dailyContribution} (${schedule})\n` +
      `📌 Payout: GH¢${group.cashOutAmount} every ${group.daysPerCycle} marks\n` +
      `📌 MoMo: ${group.momoDetails}\n\n` +
      group.members.sort((a,b) => a.position - b.position).map(m => {
        const cycleProgress = m.daysPaid % group.daysPerCycle;
        const isDoneForCycle = m.daysPaid >= (currentRecipientPosition * group.daysPerCycle);
        const status = isDoneForCycle ? '✅' : '❌';
        return `${m.position}. ${m.name}: ${m.daysPaid} marks ${status} ${m.hasCashedOut ? '💰' : ''}`;
      }).join('\n') +
      `\n\nTarget: ${group.daysPerCycle} marks per payout cycle. 💰 = Cashed out.`;

    navigator.clipboard.writeText(message);
    toast({ title: "Copied!", description: "WhatsApp status message ready to paste." });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">Circle Members ({group.members.length})</h2>
        <Button variant="ghost" size="sm" onClick={copyStatusMessage} className="text-primary hover:text-primary/80 font-bold">
          <Share2 className="h-4 w-4 mr-2" />
          Share Status
        </Button>
      </div>

      <div className="space-y-3">
        {group.members.sort((a, b) => a.position - b.position).map((member) => {
          // Progress relative to current recipient's needs
          const totalRequiredMarksSoFar = currentRecipientPosition * group.daysPerCycle;
          const isDoneSoFar = member.daysPaid >= totalRequiredMarksSoFar;
          const isRecipient = member.position === currentRecipientPosition;

          return (
            <div key={member.id} className={cn(
              "bg-white rounded-2xl p-4 shadow-sm border transition-all",
              isRecipient ? "border-accent/40 bg-accent/5" : "border-transparent hover:border-primary/20"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                    member.hasCashedOut ? "bg-accent text-white" : 
                    isRecipient ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"
                  )}>
                    {member.position}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm leading-none">
                        {member.name}
                      </h3>
                      {isRecipient && (
                        <Badge className="h-4 bg-accent text-[8px] uppercase px-1.5 border-none">
                          Recipient
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {isDoneSoFar ? (
                        <span className="text-primary font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Up to date
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {member.daysPaid} marks
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg bg-white border border-border"
                      onClick={() => handleMarkPayment(member, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      onClick={() => handleMarkPayment(member, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant={member.hasCashedOut ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleCashOut(member)}
                    className={cn(
                      "h-8 text-xs rounded-full font-bold px-3",
                      member.hasCashedOut ? "bg-accent hover:bg-accent/90" : "hover:border-primary hover:text-primary"
                    )}
                  >
                    {member.hasCashedOut ? "Cashed 💰" : "Payout"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

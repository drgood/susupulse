'use client';

import { SusuGroup, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Minus, Share2, Award, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { differenceInWeeks } from 'date-fns';

interface MemberTrackingProps {
  group: SusuGroup;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
}

export function MemberTracking({ group, onUpdateMember }: MemberTrackingProps) {
  const { toast } = useToast();

  // Calculate current week recipient
  const now = new Date();
  const start = new Date(group.startDate);
  const currentWeekIndex = Math.max(0, differenceInWeeks(now, start));
  const currentRecipientPosition = (currentWeekIndex + 1);

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
    const message = `SusuPulse: ${group.name} Status Update\n\n` +
      `📌 Daily: GH¢${group.dailyContribution}\n` +
      `📌 MoMo: ${group.momoDetails}\n\n` +
      group.members.sort((a,b) => a.position - b.position).map(m => {
        const weeklyStatus = m.daysPaid >= 7 ? '✅' : '❌';
        return `${m.position}. ${m.name}: ${m.daysPaid} marks ${weeklyStatus} ${m.hasCashedOut ? '💰' : ''}`;
      }).join('\n') +
      `\n\nWeekly cashout target: 7 marks. 💰 = Cashed out.`;

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
          // Progress relative to current week (7 days)
          const weeklyProgress = Math.min(100, (member.daysPaid / 7) * 100);
          const isRecipient = member.position === currentRecipientPosition;
          const isDoneForWeek = member.daysPaid >= 7;

          return (
            <div key={member.id} className={cn(
              "bg-white rounded-2xl p-4 shadow-sm border transition-all",
              isRecipient ? "border-accent/40 bg-accent/5" : "border-transparent hover:border-primary/20"
            )}>
              <div className="flex items-center justify-between mb-4">
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
                      {isDoneForWeek ? (
                        <span className="text-primary font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Weekly Target Met
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {member.daysPaid} / 7 marks
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant={member.hasCashedOut ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCashOut(member)}
                  className={cn(
                    "h-8 text-xs rounded-full font-bold px-4",
                    member.hasCashedOut ? "bg-accent hover:bg-accent/90" : 
                    isRecipient ? "border-accent text-accent hover:bg-accent hover:text-white" : "hover:border-primary hover:text-primary"
                  )}
                >
                  {member.hasCashedOut ? "Cashed Out 💰" : "Mark Payout"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", isDoneForWeek ? "bg-primary" : "bg-accent")} 
                      style={{ width: `${weeklyProgress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                    <span>{member.daysPaid} Marks</span>
                    <span>{Math.round(weeklyProgress)}% Weekly</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg bg-white border border-border shadow-sm"
                    onClick={() => handleMarkPayment(member, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-sm"
                    onClick={() => handleMarkPayment(member, 1)}
                  >
                    <Plus className="h-3 w-3" />
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

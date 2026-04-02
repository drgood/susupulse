'use client';

import { SusuGroup, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Minus, Clock, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, calculateActiveDaysPassed } from '@/lib/utils';

interface MemberTrackingProps {
  group: SusuGroup;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
}

export function MemberTracking({ group, onUpdateMember }: MemberTrackingProps) {
  const { toast } = useToast();

  const activeDaysPassed = calculateActiveDaysPassed(group);
  const currentRecipientPosition = Math.floor(activeDaysPassed / group.daysPerCycle) + 1;
  const targetMarksForCycle = currentRecipientPosition * group.daysPerCycle;

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">Circle Members</h2>
        <Badge variant="outline" className="rounded-full border-primary/20 text-primary px-3">
          {group.members.length} Total
        </Badge>
      </div>

      <div className="space-y-3">
        {group.members.sort((a, b) => a.position - b.position).map((member) => {
          const isDoneSoFar = member.daysPaid >= targetMarksForCycle;
          const isRecipient = member.position === currentRecipientPosition;
          
          // Dots logic: show dots for the current payout cycle
          const startOfCurrentCycle = (currentRecipientPosition - 1) * group.daysPerCycle;
          const dotsPaidInCurrentCycle = Math.max(0, member.daysPaid - startOfCurrentCycle);

          return (
            <div key={member.id} className={cn(
              "bg-white rounded-2xl p-4 shadow-sm border transition-all",
              isRecipient ? "border-accent/40 bg-accent/5" : "border-border hover:border-primary/20"
            )}>
              <div className="flex items-center justify-between mb-3">
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
                          Next Recipient
                        </Badge>
                      )}
                      {member.hasCashedOut && (
                        <span className="text-xs">💰</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {isDoneSoFar ? (
                        <span className="text-[10px] text-primary font-bold flex items-center gap-1 uppercase tracking-wider">
                          <Check className="h-3 w-3" /> Fully Paid
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-wider">
                          <Clock className="h-3 w-3" /> {member.daysPaid} marks
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex bg-secondary/50 rounded-lg p-0.5 border border-border">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-white"
                      onClick={() => handleMarkPayment(member, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-white text-primary"
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
                      "h-8 text-[10px] uppercase rounded-lg font-black px-3",
                      member.hasCashedOut ? "bg-accent hover:bg-accent/90" : "hover:border-primary hover:text-primary"
                    )}
                  >
                    {member.hasCashedOut ? "Cashed" : "Payout"}
                  </Button>
                </div>
              </div>

              {/* Day Dots Visualization */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from({ length: group.daysPerCycle }).map((_, i) => {
                  const isPaid = i < dotsPaidInCurrentCycle;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold transition-all",
                        isPaid 
                          ? (member.hasCashedOut ? "bg-accent text-white" : "bg-primary text-white") 
                          : "bg-muted text-muted-foreground border border-border"
                      )}
                    >
                      {isPaid ? <Check className="h-2.5 w-2.5" /> : `D${i + 1}`}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-primary/40 text-primary font-bold">
        <Plus className="h-4 w-4 mr-2" />
        Add New Member
      </Button>
    </div>
  );
}

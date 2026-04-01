'use client';

import { SusuGroup, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Plus, Minus, Share2, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MemberTrackingProps {
  group: SusuGroup;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
}

export function MemberTracking({ group, onUpdateMember }: MemberTrackingProps) {
  const { toast } = useToast();

  const handleMarkPayment = (member: Member, delta: number) => {
    const newDays = Math.max(0, Math.min(group.durationInDays, member.daysPaid + delta));
    onUpdateMember(member.id, { daysPaid: newDays, lastPaymentDate: new Date().toISOString() });
  };

  const handleToggleCashOut = (member: Member) => {
    onUpdateMember(member.id, { hasCashedOut: !member.hasCashedOut });
    toast({
      title: member.hasCashedOut ? "Unmarked Cash Out" : "Marked as Cashed Out",
      description: `${member.name} has been updated.`,
    });
  };

  const copyStatusMessage = () => {
    const message = `SusuPulse: ${group.name} Status\n\n` +
      `Daily: GH₵${group.dailyContribution} | Frequency: ${group.paymentFrequency}\n` +
      `MoMo: ${group.momoDetails}\n\n` +
      group.members.map(m => {
        const progress = Math.round((m.daysPaid / group.durationInDays) * 100);
        return `${m.position}. ${m.name}: ${m.daysPaid}/${group.durationInDays} days (${progress}%) ${m.hasCashedOut ? '🏆' : ''}`;
      }).join('\n') +
      `\n\nGenerated via SusuPulse`;

    navigator.clipboard.writeText(message);
    toast({ title: "Copied!", description: "WhatsApp status message copied to clipboard." });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">Members ({group.members.length})</h2>
        <Button variant="ghost" size="sm" onClick={copyStatusMessage} className="text-primary hover:text-primary/80">
          <Share2 className="h-4 w-4 mr-2" />
          Share Status
        </Button>
      </div>

      <div className="space-y-3">
        {group.members.sort((a, b) => a.position - b.position).map((member) => {
          const progress = (member.daysPaid / group.durationInDays) * 100;
          const isBehind = member.daysPaid < (group.paymentFrequency === 'weekly' ? 7 : 1); // Mock logic for being behind

          return (
            <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    member.hasCashedOut ? "bg-accent text-white" : "bg-primary/10 text-primary"
                  )}>
                    {member.position}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none flex items-center gap-2">
                      {member.name}
                      {member.hasCashedOut && <Award className="h-3 w-3 text-accent" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {member.daysPaid} / {group.durationInDays} days paid
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant={member.hasCashedOut ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCashOut(member)}
                  className={cn(
                    "h-8 text-xs rounded-full",
                    member.hasCashedOut ? "bg-accent hover:bg-accent/90" : "hover:border-accent hover:text-accent"
                  )}
                >
                  {member.hasCashedOut ? "Cashed Out" : "Cash Out"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tighter">
                    <span className={isBehind ? "text-destructive" : "text-primary"}>
                      {isBehind ? "Status: Behind" : "Status: Active"}
                    </span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-md"
                    onClick={() => handleMarkPayment(member, group.paymentFrequency === 'weekly' ? -7 : -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-md bg-primary/20 text-primary hover:bg-primary/30"
                    onClick={() => handleMarkPayment(member, group.paymentFrequency === 'weekly' ? 7 : 1)}
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
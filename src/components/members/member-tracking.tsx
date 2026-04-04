'use client';

import { useState } from 'react';
import { SusuGroup, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus, Minus, Clock, Wallet, Coins, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, calculateActiveDaysPassed } from '@/lib/utils';
import { db } from '@/lib/db';
import { ManageMembersDialog } from './manage-members-dialog';

interface MemberTrackingProps {
  group: SusuGroup;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
  onMembersUpdate?: () => void;
}

function QuickPayPopover({ group, member, onUpdateMember }: { group: SusuGroup, member: Member, onUpdateMember: (id: string, updates: Partial<Member>) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amountStr, setAmountStr] = useState('');

  const handlePay = async () => {
    const amountEntered = parseFloat(amountStr);

    if (isNaN(amountEntered) || amountEntered <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    if (group.dailyContribution <= 0) {
      toast({ title: "Error", description: "Daily contribution must be set first.", variant: "destructive" });
      return;
    }

    try {
      await db.transaction('rw', db.groups, db.paymentLogs, async () => {
        // Core Math
        const currentCredit = member.creditRemainder || 0;
        const totalAvailable = amountEntered + currentCredit;
        const dailyRate = group.dailyContribution;
        
        const newDaysCovered = Math.floor(totalAvailable / dailyRate);
        const newRemainder = Math.round((totalAvailable % dailyRate) * 100) / 100;
        const newDaysPaid = member.daysPaid + newDaysCovered;

        // 1. Update Group -> Member array
        const groupData = await db.groups.get(group.id);
        if (!groupData) throw new Error("Group not found");
        
        const updatedMembers = groupData.members.map(m => 
          m.id === member.id ? { 
            ...m, 
            daysPaid: newDaysPaid, 
            creditRemainder: newRemainder,
            lastPaymentDate: new Date().toISOString() 
          } : m
        );
        
        await db.groups.update(group.id, { members: updatedMembers });

        // 2. Insert Audit Log
        await db.paymentLogs.add({
          id: crypto.randomUUID(),
          groupId: group.id,
          memberId: member.id,
          amountPaid: amountEntered,
          previousCredit: currentCredit,
          newRemainder: newRemainder,
          previousDaysPaid: member.daysPaid,
          newDaysPaid: newDaysPaid,
          timestamp: new Date().toISOString()
        });

        // We also need to trigger the UI update function passed from parent to keep React state in sync
        // if it's being optimistic. But since the parent uses live query, the DB update is usually enough.
        // We'll call onUpdateMember just for the local state if needed, but since it's inside a transaction, 
        // the live query will pick it up automatically. Let's call it just in case, but omit DB update in parent.
        // Actually, the parent `updateMember` does a db.update too. We should NOT call parent's updateMember
        // because it would overwrite our transaction! We rely on the live query.
        
        setOpen(false);
        setAmountStr('');

        toast({
          title: "Payment Recorded",
          description: `GH¢${amountEntered} received → ${newDaysCovered} day(s) added. GH¢${newRemainder} carried forward.`,
        });
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Transaction failed. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary transition-colors border-primary/20 text-primary/80"
        >
          <Wallet className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-primary/10" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">Quick Pay</h4>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-none">
              Rate: GH¢{group.dailyContribution}/day
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">GH¢</span>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="pl-12 h-10 rounded-xl"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePay()}
                autoFocus
              />
            </div>
            
            {(member.creditRemainder || 0) > 0 && (
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                <Coins className="h-3 w-3" />
                Includes GH¢{member.creditRemainder} existing credit
              </p>
            )}
            
            <Button onClick={handlePay} className="w-full rounded-xl h-10 font-bold shadow-sm">
              Submit Payment
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function MemberTracking({ group, onUpdateMember, onMembersUpdate }: MemberTrackingProps) {
  const { toast } = useToast();
  const [isManageOpen, setIsManageOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full border-primary/20 text-primary px-3">
            {group.members.length} Total
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManageOpen(true)}
            className="h-8 rounded-full px-3 text-xs font-bold"
          >
            <Settings2 className="h-3 w-3 mr-1.5" />
            Manage
          </Button>
        </div>
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
                      {(member.creditRemainder || 0) > 0 && (
                        <Badge variant="outline" className="h-4 text-[9px] px-1.5 border-amber-200 bg-amber-50 text-amber-600 rounded flex items-center gap-0.5 shadow-none">
                          <Coins className="h-2.5 w-2.5" /> +GH¢{member.creditRemainder}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <QuickPayPopover group={group} member={member} onUpdateMember={onUpdateMember} />
                  
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

      <ManageMembersDialog
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
        group={group}
        onMembersUpdate={onMembersUpdate || (() => {})}
      />
    </div>
  );
}

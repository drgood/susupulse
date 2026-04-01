'use client';

import { SusuGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { differenceInCalendarDays, isWeekend } from 'date-fns';

export function WhatsAppShare({ group }: { group: SusuGroup }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  const generateMessage = () => {
    const schedule = group.contributionSchedule === 'all_days' ? 'Mon-Sun' : 'Mon-Fri';
    const weeklyRate = group.dailyContribution * (group.contributionSchedule === 'all_days' ? 7 : 5);
    
    const header = `GH¢${group.dailyContribution} daily (${schedule}) for ${group.maxMembers} people. Cash out GH¢${group.cashOutAmount} 💰\n` +
      `Momo: ${group.momoDetails}\n\n`;
    
    const memberList = group.members
      .sort((a, b) => a.position - b.position)
      .map(m => {
        // Calculate marks for the CURRENT cycle
        const startOfCurrentCycle = (currentRecipientPosition - 1) * group.daysPerCycle;
        const paidInCurrentCycle = Math.max(0, m.daysPaid - startOfCurrentCycle);
        const marksCount = Math.min(group.daysPerCycle, paidInCurrentCycle);
        
        const marks = '✅'.repeat(marksCount);
        const cashOutIcon = m.hasCashedOut ? ' 💰' : '';
        
        return `${m.position}. ${m.name}${marks ? ' ' + marks : ''}${cashOutIcon}`;
      })
      .join('\n');
      
    const footer = `\n\nYou have the option to make payments either daily (GH¢${group.dailyContribution}) or weekly (GH¢${weeklyRate}), with the weekly payment due by Sunday at 5pm.\n\n` +
      `Payment via Momo only. Send screenshot or Use your name as Reference for confirmation\n\n` +
      `Cash out 💰 | Not paid ❌ | Paid ✅`;
    
    return header + memberList + footer;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    toast({
      title: "Copied!",
      description: "WhatsApp status message copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">WhatsApp Update</CardTitle>
        <Share2 className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Copy this formatted message to share the circle's current status in your WhatsApp group.
        </p>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
          {generateMessage()}
        </div>

        <Button 
          onClick={copyToClipboard} 
          className="w-full h-12 rounded-xl font-bold gap-2"
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? 'Copied to Clipboard' : 'Copy Status Message'}
        </Button>
      </CardContent>
    </Card>
  );
}

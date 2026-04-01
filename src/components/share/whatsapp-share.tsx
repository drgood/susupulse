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
    
    return `💰 *${group.name} Status Update* 💰\n\n` +
      `📌 *Daily:* GH¢${group.dailyContribution} (${schedule})\n` +
      `📌 *Weekly:* GH¢${weeklyRate} (Due Sun 5PM)\n` +
      `📌 *Payout:* GH¢${group.cashOutAmount} every ${group.daysPerCycle} marks\n` +
      `📌 *MoMo:* ${group.momoDetails}\n\n` +
      `*Member Status:*\n` +
      group.members.sort((a,b) => a.position - b.position).map(m => {
        const isDoneForCycle = m.daysPaid >= (currentRecipientPosition * group.daysPerCycle);
        const marks = '✅'.repeat(Math.min(7, m.daysPaid % group.daysPerCycle || (m.daysPaid >= (currentRecipientPosition * group.daysPerCycle) ? group.daysPerCycle : 0)));
        const statusIcon = isDoneForCycle ? '✅' : '❌';
        const cashOutIcon = m.hasCashedOut ? '💰' : '';
        return `${m.position}. ${m.name}: ${m.daysPaid} marks ${statusIcon}${cashOutIcon}`;
      }).join('\n') +
      `\n\n*Payment via Momo only.* Send screenshot or Use your name as Reference for confirmation.\n\n_Cash out 💰 | Not paid ❌ | Paid ✅_`;
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
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
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

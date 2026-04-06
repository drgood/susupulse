'use client';

import { SusuGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { calculateActiveDaysPassed, getWeeklyFrequency } from '@/lib/utils';

export function WhatsAppShare({ group }: { group: SusuGroup }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const activeDaysPassed = calculateActiveDaysPassed(group);
  const currentRecipientPosition = Math.floor(activeDaysPassed / group.daysPerCycle) + 1;

  const generateMessage = () => {
    const weeklyFreq = getWeeklyFrequency(group);
    const schedule = group.contributionSchedule === 'all_days' 
      ? 'Mon-Sun' 
      : group.contributionSchedule === 'weekdays_only' 
      ? 'Mon-Fri' 
      : `${weeklyFreq} days/week`;

    const weeklyRate = group.dailyContribution * weeklyFreq;
    const momoInfo = group.momoNumber ? `${group.momoNumber} (${group.momoName})` : 'Contact Admin';
    
    const header = `GH¢${group.dailyContribution} daily (${schedule}) for ${group.maxMembers} people. Cash out GH¢${group.cashOutAmount} 💰\n` +
      `Momo: ${momoInfo}\n\n`;
    
    const memberList = group.members
      .sort((a, b) => a.position - b.position)
      .map(m => {
        const startOfCurrentCycle = (currentRecipientPosition - 1) * group.daysPerCycle;
        const paidInCurrentCycle = Math.max(0, m.daysPaid - startOfCurrentCycle);
        const marksCount = Math.min(group.daysPerCycle, paidInCurrentCycle);
        
        const marks = '✅'.repeat(marksCount);
        const cashOutIcon = m.hasCashedOut ? '💰 ' : '';
        const creditText = (m.creditRemainder || 0) > 0 ? ` (+GH¢${m.creditRemainder})` : '';
        
        return `${m.position}. ${cashOutIcon}${m.name}${marks ? ' ' + marks : ''}${creditText}`;
      })
      .join('\n');
      
    const footer = `\n\nYou have the option to make payments either daily (GH¢${group.dailyContribution}) or weekly (GH¢${weeklyRate}), with the weekly payment due by the end of the week.\n\n` +
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
        
        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
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

'use client';

import { useState } from 'react';
import { SusuGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BrainCircuit, MessageSquare, Loader2 } from 'lucide-react';
import { aiAdminDefaulterPrediction, AIAdminDefaulterPredictionOutput } from '@/ai/flows/ai-admin-defaulter-prediction-flow';
import { generateCommunicationStrategy, AIAdminCommunicationStrategyOutput } from '@/ai/flows/ai-admin-communication-strategy-flow';

export function AIInsightsPanel({ group }: { group: SusuGroup }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<AIAdminDefaulterPredictionOutput | null>(null);
  const [strategy, setStrategy] = useState<AIAdminCommunicationStrategyOutput | null>(null);

  const getDefaulterInsights = async () => {
    setLoading('defaulter');
    try {
      const result = await aiAdminDefaulterPrediction({
        groupName: group.name,
        dailyContributionAmount: group.dailyContribution,
        paymentFrequency: group.paymentFrequency,
        currentDate: new Date().toISOString(),
        members: group.members.map(m => ({
          name: m.name,
          daysPaid: m.daysPaid,
          joinDate: m.joinDate,
          hasCashedOut: m.hasCashedOut,
          lastPaymentDate: m.lastPaymentDate
        }))
      });
      setPrediction(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const getCommunicationStrategy = async () => {
    setLoading('comm');
    try {
      const result = await generateCommunicationStrategy({
        scenario: 'payment_reminder',
        groupName: group.name,
        dailyContribution: group.dailyContribution,
        paymentFrequency: group.paymentFrequency,
        deadline: 'Tomorrow at 5 PM',
        memberDetails: group.members.map(m => ({
          name: m.name,
          daysPaid: m.daysPaid,
          isCashedOut: m.hasCashedOut,
          isDefaulter: m.daysPaid < 5 // dummy check
        }))
      });
      setStrategy(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Admin Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col gap-2 border-primary/20 hover:bg-primary/10"
            onClick={getDefaulterInsights}
            disabled={!!loading}
          >
            {loading === 'defaulter' ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5 text-primary" />}
            <span className="text-xs font-bold">Predict Defaulters</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col gap-2 border-accent/20 hover:bg-accent/10"
            onClick={getCommunicationStrategy}
            disabled={!!loading}
          >
            {loading === 'comm' ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5 text-accent" />}
            <span className="text-xs font-bold">Engage Members</span>
          </Button>
        </div>

        {prediction && (
          <div className="p-3 bg-white rounded-lg border border-primary/10 text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
              Prediction Summary
            </h4>
            <p className="text-muted-foreground italic leading-relaxed">{prediction.overallInsight}</p>
            {prediction.potentialDefaulters.length > 0 && (
              <div className="space-y-2 pt-1">
                {prediction.potentialDefaulters.slice(0, 2).map((d, i) => (
                  <div key={i} className="bg-destructive/5 p-2 rounded border border-destructive/10">
                    <span className="font-bold text-destructive">{d.memberName}:</span> {d.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {strategy && (
          <div className="p-3 bg-white rounded-lg border border-accent/10 text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold text-accent flex items-center gap-1 uppercase tracking-wider">
              Suggested Strategy
            </h4>
            <div className="p-2 bg-accent/5 rounded font-medium text-accent-foreground border border-accent/20 leading-relaxed">
              "{strategy.suggestedMessage}"
            </div>
            <p className="text-[10px] text-muted-foreground text-right uppercase font-bold">Tone: {strategy.tone}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
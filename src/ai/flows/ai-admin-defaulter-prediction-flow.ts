'use server';
/**
 * @fileOverview This file implements a Genkit flow for identifying potential defaulters in a Susu group.
 *
 * - aiAdminDefaulterPrediction - A function that leverages AI to predict potential defaulters.
 * - AIAdminDefaulterPredictionInput - The input type for the aiAdminDefaulterPrediction function.
 * - AIAdminDefaulterPredictionOutput - The return type for the aiAdminDefaulterPrediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIAdminDefaulterPredictionInputSchema = z.object({
  groupName: z.string().describe('The name of the Susu group.'),
  dailyContributionAmount: z.number().min(0).describe('The daily contribution amount expected from each member.'),
  paymentFrequency: z.enum(['daily', 'weekly']).describe('The frequency at which members are expected to make contributions.'),
  currentDate: z.string().datetime().describe('The current date in ISO format, used to calculate payment delinquency.'),
  members: z.array(
    z.object({
      name: z.string().describe('The name of the member.'),
      daysPaid: z.number().int().min(0).describe('The number of days the member has paid their contribution.'),
      lastPaymentDate: z.string().datetime().optional().describe('The date of the member\'s last recorded payment in ISO format. Null if no payments made.'),
      joinDate: z.string().datetime().describe('The date the member joined the Susu group in ISO format.'),
      hasCashedOut: z.boolean().describe('True if the member has already cashed out, meaning they are no longer expected to pay.'),
    })
  ).describe('A list of all members in the Susu group with their payment details.'),
});

export type AIAdminDefaulterPredictionInput = z.infer<typeof AIAdminDefaulterPredictionInputSchema>;

const AIAdminDefaulterPredictionOutputSchema = z.object({
  potentialDefaulters: z.array(
    z.object({
      memberName: z.string().describe('The name of the potential defaulter.'),
      reason: z.string().describe('A detailed explanation of why this member is identified as a potential defaulter, considering payment patterns, frequency, and current date.'),
      suggestedAction: z.string().describe('A concrete, actionable suggestion for the administrator to address the potential default (e.g., "Send a gentle reminder about upcoming payment", "Initiate a private conversation about their payment plan", "Review their payment history for inconsistencies").'),
    })
  ).describe('A list of members identified as potential defaulters, along with reasons and suggested actions.'),
  overallInsight: z.string().describe('An overall insight or summary of the group\'s payment health, and any general observations or recommendations for the administrator.'),
});

export type AIAdminDefaulterPredictionOutput = z.infer<typeof AIAdminDefaulterPredictionOutputSchema>;

export async function aiAdminDefaulterPrediction(input: AIAdminDefaulterPredictionInput): Promise<AIAdminDefaulterPredictionOutput> {
  return aiAdminDefaulterPredictionFlow(input);
}

const defaulterPredictionPrompt = ai.definePrompt({
  name: 'defaulterPredictionPrompt',
  input: { schema: AIAdminDefaulterPredictionInputSchema },
  output: { schema: AIAdminDefaulterPredictionOutputSchema },
  prompt: `You are an expert financial analyst specializing in Susu group management. Your task is to analyze the provided Susu group and member payment data to proactively identify potential defaulters and offer actionable insights to the administrator.

Consider the following Susu group details:
- Group Name: {{{groupName}}}
- Daily Contribution Amount: {{{dailyContributionAmount}}}
- Expected Payment Frequency: {{{paymentFrequency}}}
- Current Date: {{{currentDate}}}

Here are the members' payment details. For each member, calculate their expected payments based on their join date, the current date, and the payment frequency, then compare it to their actual days paid. Ignore members who have already cashed out, as they are no longer expected to contribute.

{{#each members}}
  {{#unless hasCashedOut}}
  - Member Name: {{{name}}}
    Days Paid: {{{daysPaid}}}
    Last Payment Date: {{{lastPaymentDate}}}
    Join Date: {{{joinDate}}}
  {{/unless}}
{{/each}}

Based on this data, identify members who show signs of being potential defaulters. For each potential defaulter, provide a clear reason for your assessment and a specific, actionable suggestion for the Susu administrator. Also, provide an overall insight into the group's payment health. Ensure your output strictly adheres to the provided JSON schema.`,
});

const aiAdminDefaulterPredictionFlow = ai.defineFlow(
  {
    name: 'aiAdminDefaulterPredictionFlow',
    inputSchema: AIAdminDefaulterPredictionInputSchema,
    outputSchema: AIAdminDefaulterPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await defaulterPredictionPrompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview This file implements a Genkit flow to suggest optimized communication messages for Susu administrators.
 * It provides an AI tool to help administrators engage effectively with members for various scenarios like payment reminders or group updates.
 *
 * - generateCommunicationStrategy - A function that generates an optimized communication message based on the input scenario.
 * - AIAdminCommunicationStrategyInput - The input type for the generateCommunicationStrategy function.
 * - AIAdminCommunicationStrategyOutput - The return type for the generateCommunicationStrategy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIAdminCommunicationStrategyInputSchema = z.object({
  scenario: z
    .enum([
      'payment_reminder',
      'group_update',
      'defaulter_follow_up',
      'new_member_welcome',
      'payout_announcement',
      'custom',
    ])
    .describe('The communication scenario, e.g., payment reminder, group update.'),
  groupName: z.string().describe('The name of the Susu group.'),
  dailyContribution: z.number().describe('The daily contribution amount for the group.'),
  paymentFrequency: z
    .string()
    .describe('The flexible payment frequency, e.g., daily, weekly.'),
  deadline: z.string().describe('The next payment deadline (e.g., "Tomorrow, 5 PM").'),
  memberDetails: z
    .array(
      z.object({
        name: z.string().describe('The name of the member.'),
        daysPaid: z.number().describe('The number of days the member has paid.'),
        isCashedOut: z.boolean().describe('Whether the member has cashed out.'),
        isDefaulter: z.boolean().optional().describe('Whether the member is currently a defaulter.'),
      })
    )
    .describe('Details of all members in the group.'),
  specificMemberName: z
    .string()
    .optional()
    .describe('Optional: Name of a specific member if the message is personalized.'),
  additionalContext: z
    .string()
    .optional()
    .describe('Optional: Any additional context or details for the message.'),
});
export type AIAdminCommunicationStrategyInput = z.infer<
  typeof AIAdminCommunicationStrategyInputSchema
>;

const AIAdminCommunicationStrategyOutputSchema = z.object({
  suggestedMessage: z.string().describe('The optimized communication message.'),
  tone: z
    .enum(['friendly', 'firm', 'encouraging', 'neutral'])
    .optional()
    .describe('The suggested tone of the message.'),
});
export type AIAdminCommunicationStrategyOutput = z.infer<
  typeof AIAdminCommunicationStrategyOutputSchema
>;

export async function generateCommunicationStrategy(
  input: AIAdminCommunicationStrategyInput
): Promise<AIAdminCommunicationStrategyOutput> {
  return aiAdminCommunicationStrategyFlow(input);
}

const communicationStrategyPrompt = ai.definePrompt({
  name: 'communicationStrategyPrompt',
  input: { schema: AIAdminCommunicationStrategyInputSchema },
  output: { schema: AIAdminCommunicationStrategyOutputSchema },
  prompt: `You are an AI assistant designed to help Susu administrators craft effective and engaging communication messages for their group members.

Generate an optimized communication message based on the following scenario and details:

Susu Group Name: {{{groupName}}}
Daily Contribution: {{{dailyContribution}}}
Payment Frequency: {{{paymentFrequency}}}
Next Deadline: {{{deadline}}}
Scenario: {{{scenario}}}

{{#if specificMemberName}}
Specific Member for this message: {{{specificMemberName}}}
{{/if}}

{{#if additionalContext}}
Additional Context: {{{additionalContext}}}
{{/if}}

Member Details:
{{#each memberDetails}}
- Name: {{{name}}}, Days Paid: {{{daysPaid}}}, Cashed Out: {{{isCashedOut}}}{{#if isDefaulter}}, Defaulter: {{{isDefaulter}}}{{/if}}
{{/each}}

Consider the scenario, group details, and member statuses (especially for payment reminders or defaulter follow-ups). The message should be clear, concise, and appropriate for the context. For reminders, be friendly but firm. For general updates, be encouraging. For defaulter follow-ups, be empathetic but clear about expectations.

Generate the suggested message and also identify its primary tone.`,
});

const aiAdminCommunicationStrategyFlow = ai.defineFlow(
  {
    name: 'aiAdminCommunicationStrategyFlow',
    inputSchema: AIAdminCommunicationStrategyInputSchema,
    outputSchema: AIAdminCommunicationStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await communicationStrategyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate communication strategy.');
    }
    return output;
  }
);

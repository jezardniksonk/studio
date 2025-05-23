// use server'
'use server';

/**
 * @fileOverview A flow to remind users of commonly forgotten items based on their packing list.
 *
 * - didYouForgetReminder - A function that suggests commonly forgotten items.
 * - DidYouForgetReminderInput - The input type for the didYouForgetReminder function.
 * - DidYouForgetReminderOutput - The return type for the didYouForgetReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DidYouForgetReminderInputSchema = z.object({
  tripType: z
    .string()
    .describe('The type of trip (e.g., beach, business, hiking).'),
  duration: z.number().describe('The duration of the trip in days.'), // Changed from z.string() to z.number()
  packedItems: z
    .array(z.string())
    .describe('A list of items the user has already packed.'),
});
export type DidYouForgetReminderInput = z.infer<typeof DidYouForgetReminderInputSchema>;

const DidYouForgetReminderOutputSchema = z.object({
  suggestedItems: z
    .array(z.string())
    .describe('A list of commonly forgotten items based on the packed items and trip details.'),
});
export type DidYouForgetReminderOutput = z.infer<typeof DidYouForgetReminderOutputSchema>;

export async function didYouForgetReminder(
  input: DidYouForgetReminderInput
): Promise<DidYouForgetReminderOutput> {
  return didYouForgetReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'didYouForgetReminderPrompt',
  input: {schema: DidYouForgetReminderInputSchema},
  output: {schema: DidYouForgetReminderOutputSchema},
  prompt: `You are a helpful packing assistant. Given the type of trip, duration, and a list of items the user has already packed, you will suggest a list of commonly forgotten items that the user might need. Focus on essential items that are easily forgotten. Do not suggest items already in the packed list.

Trip Type: {{{tripType}}}
Duration: {{{duration}}} days
Packed Items: {{#if packedItems}}{{#each packedItems}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

Suggest commonly forgotten items (provide an empty list if no relevant suggestions or if the packed list is empty):`,
});

const didYouForgetReminderFlow = ai.defineFlow(
  {
    name: 'didYouForgetReminderFlow',
    inputSchema: DidYouForgetReminderInputSchema,
    outputSchema: DidYouForgetReminderOutputSchema,
  },
  async input => {
    // Ensure packedItems is not empty before calling the prompt if the prompt requires it.
    // The prompt itself is robust enough to handle empty packedItems with {{#if packedItems}}.
    const {output} = await prompt(input);
    return output!;
  }
);

// packing-suggestions.ts
'use server';

/**
 * @fileOverview Packing suggestion AI agent.
 *
 * - packingSuggestions - A function that suggests packing items based on trip details and weather.
 * - PackingSuggestionsInput - The input type for the packingSuggestions function.
 * - PackingSuggestionsOutput - The return type for the packingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PackingSuggestionsInputSchema = z.object({
  tripType: z
    .string()
    .describe('The type of trip (e.g., beach, business, hiking).'),
  duration: z.number().describe('The duration of the trip in days.'),
  destinationWeather: z
    .string()
    .describe('The weather forecast for the destination.'),
});
export type PackingSuggestionsInput = z.infer<typeof PackingSuggestionsInputSchema>;

const PackingSuggestionsOutputSchema = z.object({
  packingList: z
    .array(z.string())
    .describe('A list of suggested packing items.'),
});
export type PackingSuggestionsOutput = z.infer<typeof PackingSuggestionsOutputSchema>;

const DidYouForgetTool = ai.defineTool({
  name: 'didYouForget',
  description: 'Checks if the user has forgotten any essential items based on common user oversights.',
  inputSchema: z.object({
    tripType: z
      .string()
      .describe('The type of trip (e.g., beach, business, hiking).'),
    packingList: z
      .array(z.string())
      .describe('The current packing list to check for omissions.'),
  }),
  outputSchema: z.array(z.string()).describe('A list of potentially forgotten items.'),
  async implementation(input) {
    // Dummy implementation - replace with actual logic
    const forgottenItems: string[] = [];
    if (input.tripType === 'beach' && !input.packingList.includes('sunscreen')) {
      forgottenItems.push('sunscreen');
    }
    if (input.tripType === 'business' && !input.packingList.includes('laptop')) {
      forgottenItems.push('laptop');
    }
    return forgottenItems;
  },
});

export async function packingSuggestions(
  input: PackingSuggestionsInput
): Promise<PackingSuggestionsOutput> {
  return packingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'packingSuggestionsPrompt',
  input: {schema: PackingSuggestionsInputSchema},
  output: {schema: PackingSuggestionsOutputSchema},
  tools: [DidYouForgetTool],
  prompt: `You are a packing assistant. Based on the trip type ({{{tripType}}}), duration ({{{duration}}} days), and destination weather ({{{destinationWeather}}}), suggest a packing list.

If the user is going on a trip, always remind them to bring essentials like phone and wallet, even if it is not explicitly asked for.

Based on common user oversights, use the didYouForget tool to determine if the user may have forgotten any critical items.  If items are suggested by the tool, include them in the list.

Packing List:`, // Make sure the prompt is valid Handlebars.
});

const packingSuggestionsFlow = ai.defineFlow(
  {
    name: 'packingSuggestionsFlow',
    inputSchema: PackingSuggestionsInputSchema,
    outputSchema: PackingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

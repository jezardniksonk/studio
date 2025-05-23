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

export async function packingSuggestions(
  input: PackingSuggestionsInput
): Promise<PackingSuggestionsOutput> {
  return packingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'packingSuggestionsPrompt',
  input: {schema: PackingSuggestionsInputSchema},
  output: {schema: PackingSuggestionsOutputSchema},
  prompt: `You are a packing assistant. Based on the trip type ({{{tripType}}}), duration ({{{duration}}} days), and destination weather ({{{destinationWeather}}}), suggest a comprehensive packing list.

Ensure to include common essentials appropriate for the trip, such as phone, wallet, chargers, and any relevant travel documents, even if not explicitly derived from the other inputs. Consider items that are frequently forgotten.

Provide the output as a list of items.

Packing List:`,
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

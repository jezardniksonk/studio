
'use server';
/**
 * @fileOverview Generates beautiful travel images for a given destination.
 *
 * - generateDestinationImages - A function that generates 5 images for a destination.
 * - GenerateDestinationImagesInput - The input type.
 * - GenerateDestinationImagesOutput - The output type (array of image data URIs).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDestinationImagesInputSchema = z.object({
  destinationName: z.string().describe('The name of the travel destination.'),
});
export type GenerateDestinationImagesInput = z.infer<typeof GenerateDestinationImagesInputSchema>;

const GenerateDestinationImagesOutputSchema = z.object({
  imageDataUris: z.array(z.string()).describe('An array of 5 image data URIs in base64 format.'),
});
export type GenerateDestinationImagesOutput = z.infer<typeof GenerateDestinationImagesOutputSchema>;

export async function generateDestinationImages(
  input: GenerateDestinationImagesInput
): Promise<GenerateDestinationImagesOutput> {
  return generateDestinationImagesFlow(input);
}

const imagePrompts = (destinationName: string) => [
  `A stunning, high-quality, travel-style photograph of an iconic landmark in ${destinationName}.`,
  `A beautiful, high-quality, travel-style photograph capturing the natural scenery or landscape of ${destinationName}.`,
  `A vibrant, high-quality, travel-style photograph of a bustling street view or local life in ${destinationName}.`,
  `An inviting, high-quality, travel-style photograph showcasing local cuisine or a colorful market in ${destinationName}.`,
  `A breathtaking, high-quality, travel-style panoramic view or cityscape of ${destinationName}.`,
];

const generateDestinationImagesFlow = ai.defineFlow(
  {
    name: 'generateDestinationImagesFlow',
    inputSchema: GenerateDestinationImagesInputSchema,
    outputSchema: GenerateDestinationImagesOutputSchema,
  },
  async (input) => {
    const imageDataUris: string[] = [];
    const prompts = imagePrompts(input.destinationName);

    for (let i = 0; i < 5; i++) {
      try {
        // console.log(`Generating image ${i + 1} for ${input.destinationName} with prompt: ${prompts[i]}`);
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
          prompt: prompts[i],
          config: {
            responseModalities: ['TEXT', 'IMAGE'], // MUST provide both
            // Add safety settings if needed, for now using defaults
          },
        });

        if (media && media.url) {
          imageDataUris.push(media.url);
        } else {
          // console.warn(`Image ${i + 1} for ${input.destinationName} could not be generated or media.url is missing.`);
        }
      } catch (error) {
        console.error(`Error generating image ${i + 1} for ${input.destinationName}:`, error);
        // Continue to try and generate other images
      }
    }
    
    // If fewer than 5 images were generated, fill with placeholders to ensure 5 items for the UI.
    // This is a fallback; ideally, all 5 generate.
    while (imageDataUris.length < 5) {
        // A transparent pixel, or a very small placeholder.
        // Using a small transparent PNG data URI.
        imageDataUris.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='); 
    }


    return {imageDataUris};
  }
);

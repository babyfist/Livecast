'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically generating lower-third banners based on the detected scene content.
 *
 * - generateSceneBanner - A function that generates a lower-third banner based on the detected scene.
 * - SceneBannerInput - The input type for the generateSceneBanner function.
 * - SceneBannerOutput - The return type for the generateSceneBanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SceneBannerInputSchema = z.object({
  sceneDescription: z
    .string()
    .describe(
      'A description of the current scene, e.g., camera view, screen share, presentation slides.'
    ),
});
export type SceneBannerInput = z.infer<typeof SceneBannerInputSchema>;

const SceneBannerOutputSchema = z.object({
  bannerText: z
    .string()
    .describe(
      'The text to display on the lower-third banner. Should be concise and relevant to the scene.'
    ),
});
export type SceneBannerOutput = z.infer<typeof SceneBannerOutputSchema>;

export async function generateSceneBanner(
  input: SceneBannerInput
): Promise<SceneBannerOutput> {
  return generateSceneBannerFlow(input);
}

const sceneBannerPrompt = ai.definePrompt({
  name: 'sceneBannerPrompt',
  input: {schema: SceneBannerInputSchema},
  output: {schema: SceneBannerOutputSchema},
  prompt: `You are an AI assistant that generates concise lower-third banner text for live video streams.

  Given the description of the current scene, create relevant and informative banner text.

  Scene Description: {{{sceneDescription}}}

  Banner Text: `,
});

const generateSceneBannerFlow = ai.defineFlow(
  {
    name: 'generateSceneBannerFlow',
    inputSchema: SceneBannerInputSchema,
    outputSchema: SceneBannerOutputSchema,
  },
  async input => {
    const {output} = await sceneBannerPrompt(input);
    return output!;
  }
);

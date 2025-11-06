'use server';

/**
 * @fileOverview Finds nearby doctors and hospitals using AI.
 *
 * - findNearbyDoctors - a function that finds nearby doctors based on location and specialty.
 * - FindNearbyDoctorsInput - The input type for the findNearbyDoctors function.
 * - FindNearbyDoctorsOutput - The return type for the findNearbyDoctors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DoctorSchema } from '@/lib/types';

const FindNearbyDoctorsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  specialty: z.string().describe('The medical specialty to search for.'),
});
export type FindNearbyDoctorsInput = z.infer<
  typeof FindNearbyDoctorsInputSchema
>;

const FindNearbyDoctorsOutputSchema = z.object({
  doctors: z
    .array(DoctorSchema)
    .describe('A list of nearby doctors or hospitals.'),
});
export type FindNearbyDoctorsOutput = z.infer<
  typeof FindNearbyDoctorsOutputSchema
>;

export async function findNearbyDoctors(
  input: FindNearbyDoctorsInput
): Promise<FindNearbyDoctorsOutput> {
  return findNearbyDoctorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findNearbyDoctorsPrompt',
  input: {schema: FindNearbyDoctorsInputSchema},
  output: {schema: FindNearbyDoctorsOutputSchema},
  model: 'gemini-1.5-flash-001',
  prompt: `You are a helpful assistant that finds doctors and hospitals.
Based on the user's location and the required specialty, find 3-5 relevant medical professionals or facilities.
Provide their name, specialty, address, latitude, and longitude.

User Location: {{latitude}}, {{longitude}}
Specialty Needed: {{{specialty}}}

Output in JSON format.
`,
});

const findNearbyDoctorsFlow = ai.defineFlow(
  {
    name: 'findNearbyDoctorsFlow',
    inputSchema: FindNearbyDoctorsInputSchema,
    outputSchema: FindNearbyDoctorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

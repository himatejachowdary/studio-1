'use server';

/**
 * @fileOverview Analyzes user-provided symptoms and suggests possible conditions.
 *
 * - analyzeSymptomsAndSuggestConditions - A function that handles the symptom analysis process.
 * - AnalyzeSymptomsAndSuggestConditionsInput - The input type for the analyzeSymptomsAndSuggestConditions function.
 * - AnalyzeSymptomsAndSuggestConditionsOutput - The return type for the analyzeSymptomsAndSuggestConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsAndSuggestConditionsInputSchema = z.object({
  symptoms: z
    .string()
    .describe('The symptoms described by the user in natural language.'),
  medicalHistory: z
    .string()
    .optional()
    .describe('The medical history of the user.'),
  useMedicalHistory: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether or not to factor medical history into the analysis.'),
});
export type AnalyzeSymptomsAndSuggestConditionsInput = z.infer<
  typeof AnalyzeSymptomsAndSuggestConditionsInputSchema
>;

const AnalyzeSymptomsAndSuggestConditionsOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe('A list of possible medical conditions based on the symptoms.'),
  confidenceLevel: z
    .string()
    .describe(
      'A subjective confidence level (e.g., low, medium, high) in the accuracy of the suggested conditions.'
    ),
  nextSteps: z
    .string()
    .describe(
      'Recommended next steps for the user, such as consulting a doctor or seeking medical advice.'
    ),
});
export type AnalyzeSymptomsAndSuggestConditionsOutput = z.infer<
  typeof AnalyzeSymptomsAndSuggestConditionsOutputSchema
>;

export async function analyzeSymptomsAndSuggestConditions(
  input: AnalyzeSymptomsAndSuggestConditionsInput
): Promise<AnalyzeSymptomsAndSuggestConditionsOutput> {
  return analyzeSymptomsAndSuggestConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSymptomsAndSuggestConditionsPrompt',
  model: 'flash',
  input: {schema: AnalyzeSymptomsAndSuggestConditionsInputSchema},
  output: {schema: AnalyzeSymptomsAndSuggestConditionsOutputSchema},
  prompt: `You are an AI-powered medical assistant that analyzes symptoms
provided by users and suggests possible medical conditions. Consider
the user's medical history if provided and if the user has requested
it to be used.

Symptoms: {{{symptoms}}}

Medical History: {{#if useMedicalHistory}}{{{medicalHistory}}}{{else}}Not Used{{/if}}

Based on the symptoms, provide a list of possible conditions, a
confidence level in your suggestions, and recommended next steps for the
user.

Output in JSON format.
`,
});

const analyzeSymptomsAndSuggestConditionsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsAndSuggestConditionsFlow',
    inputSchema: AnalyzeSymptomsAndSuggestConditionsInputSchema,
    outputSchema: AnalyzeSymptomsAndSuggestConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

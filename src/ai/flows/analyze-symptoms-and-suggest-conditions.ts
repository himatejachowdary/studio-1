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
  diagnosis: z.array(z.object({
    name: z.string().describe('A possible disease name.'),
    explanation: z.string().describe('A short explanation for the possible disease.'),
  })).describe('A list of the top 3 most likely diseases.'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('The urgency level of the condition.'),
  departments: z.array(z.string()).describe('A list of recommended hospital departments.'),
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
  input: {schema: AnalyzeSymptomsAndSuggestConditionsInputSchema},
  output: {schema: AnalyzeSymptomsAndSuggestConditionsOutputSchema},
  model: 'gemini-1.5-flash',
  prompt: `You are a medical triage assistant.

Task:
- User will input symptoms in normal human language.
- You must analyse and return:
    * possible disease names (top 3 most likely)
    * short explanation for each
    * urgency level (LOW / MEDIUM / HIGH)
    * recommended hospital departments

Rules:
- Do NOT give medicine names.
- If symptoms are unclear -> ask for more symptoms.
- Keep output short and simple human readable.

User Symptoms: {{{symptoms}}}

{{#if useMedicalHistory}}
User Medical History: {{{medicalHistory}}}
{{/if}}

Return JSON only.
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

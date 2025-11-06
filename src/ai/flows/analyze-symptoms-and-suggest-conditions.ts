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
  model: 'gemini-1.5-flash-latest',
  prompt: `You are a medical symptom analysis assistant.

User will input symptoms in plain English.

Your task:
- Understand symptoms
- Generate 3 possible disease names
- Give short explanation for each
- Give urgency level: LOW / MEDIUM / HIGH
- List recommended hospital departments

Rules:
- DO NOT recommend medicine
- If symptoms are unclear -> ask for more info
- Response MUST be ONLY JSON (no extra text, no explanation)

JSON format:

{
 "diagnosis":[
   {"name":"", "explanation":""}
 ],
 "urgency":"",
 "departments":[]
}
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

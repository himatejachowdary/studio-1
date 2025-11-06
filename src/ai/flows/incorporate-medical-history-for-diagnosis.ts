'use server';

/**
 * @fileOverview Incorporates medical history into the diagnosis process.
 *
 * - incorporateMedicalHistoryForDiagnosis - A function that incorporates medical history to refine diagnosis suggestions.
 * - IncorporateMedicalHistoryForDiagnosisInput - The input type for the incorporateMedicalHistoryForDiagnosis function.
 * - IncorporateMedicalHistoryForDiagnosisOutput - The return type for the incorporateMedicalHistoryForDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncorporateMedicalHistoryForDiagnosisInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
  medicalHistory: z.string().describe('The medical history of the user.'),
});
export type IncorporateMedicalHistoryForDiagnosisInput = z.infer<
  typeof IncorporateMedicalHistoryForDiagnosisInputSchema
>;

const IncorporateMedicalHistoryForDiagnosisOutputSchema = z.object({
  diagnosisSuggestions: z
    .string()
    .describe(
      'Possible conditions suggested, refined by the user provided medical history.'
    ),
});
export type IncorporateMedicalHistoryForDiagnosisOutput = z.infer<
  typeof IncorporateMedicalHistoryForDiagnosisOutputSchema
>;

export async function incorporateMedicalHistoryForDiagnosis(
  input: IncorporateMedicalHistoryForDiagnosisInput
): Promise<IncorporateMedicalHistoryForDiagnosisOutput> {
  return incorporateMedicalHistoryForDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incorporateMedicalHistoryForDiagnosisPrompt',
  input: {
    schema: IncorporateMedicalHistoryForDiagnosisInputSchema,
  },
  output: {
    schema: IncorporateMedicalHistoryForDiagnosisOutputSchema,
  },
  model: 'gemini-pro',
  prompt: `You are a medical professional who provides possible conditions based on symptoms and medical history.

  Symptoms: {{{symptoms}}}
  Medical History: {{{medicalHistory}}}

  Provide a list of possible conditions based on the symptoms, and incorporating the medical history. Be concise.`,
});

const incorporateMedicalHistoryForDiagnosisFlow = ai.defineFlow(
  {
    name: 'incorporateMedicalHistoryForDiagnosisFlow',
    inputSchema: IncorporateMedicalHistoryForDiagnosisInputSchema,
    outputSchema: IncorporateMedicalHistoryForDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

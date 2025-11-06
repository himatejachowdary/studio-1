'use server';

/**
 * @fileOverview Interprets natural language input of symptoms to extract structured information.
 *
 * - interpretNaturalLanguageInput - A function that interprets natural language input to identify symptoms.
 * - InterpretNaturalLanguageInputInput - The input type for the interpretNaturalLanguageInput function.
 * - InterpretNaturalLanguageInputOutput - The return type for the interpretNaturalLanguageInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretNaturalLanguageInputInputSchema = z.object({
  symptoms: z
    .string()
    .describe(
      'The symptoms described in natural language (e.g., \'I have a headache and nausea\').'
    ),
});
export type InterpretNaturalLanguageInputInput = z.infer<
  typeof InterpretNaturalLanguageInputInputSchema
>;

const InterpretNaturalLanguageInputOutputSchema = z.object({
  extractedSymptoms: z
    .array(z.string())
    .describe('A list of extracted symptoms from the input.'),
  summary: z
    .string()
    .describe('A concise summary of the interpreted symptoms.'),
});
export type InterpretNaturalLanguageInputOutput = z.infer<
  typeof InterpretNaturalLanguageInputOutputSchema
>;

export async function interpretNaturalLanguageInput(
  input: InterpretNaturalLanguageInputInput
): Promise<InterpretNaturalLanguageInputOutput> {
  return interpretNaturalLanguageInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretNaturalLanguageInputPrompt',
  model: 'gemini-1.5-flash',
  input: {schema: InterpretNaturalLanguageInputInputSchema},
  output: {schema: InterpretNaturalLanguageInputOutputSchema},
  prompt: `You are a medical assistant. Please read the following symptoms provided by the user and return them as structured data.

Symptoms: {{{symptoms}}}

First, extract all of the symptoms into a list.

Then, write a summary of the user's symptoms.

Output the extracted symptoms and summary in JSON format.`,
});

const interpretNaturalLanguageInputFlow = ai.defineFlow(
  {
    name: 'interpretNaturalLanguageInputFlow',
    inputSchema: InterpretNaturalLanguageInputInputSchema,
    outputSchema: InterpretNaturalLanguageInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

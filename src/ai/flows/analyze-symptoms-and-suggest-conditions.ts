'use server';

import { ai } from '@/ai/genkit';
import { analysisSchema } from '@/lib/types';
import { z } from 'zod';

const analysisInputSchema = z.object({
  symptoms: z.string(),
  age: z.number(),
  gender: z.enum(['male', 'female', 'other']),
});


export const analyzeSymptomsAndSuggestConditions = ai.defineFlow(
  {
    name: 'analyzeSymptomsAndSuggestConditions',
    inputSchema: analysisInputSchema,
    outputSchema: analysisSchema,
  },
  async ({ symptoms, age, gender }) => {

    const analysisPrompt = ai.definePrompt({
        name: 'analysisPrompt',
        model: 'gemini-1.5-flash-latest',
        input: { schema: analysisInputSchema },
        output: { schema: analysisSchema },
        prompt: `You are an expert medical diagnostician AI. A user has provided their symptoms, age, and gender.
        
        User Information:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms: "${symptoms}"

        Your tasks are:
        1.  Provide a brief summary of the user's situation based on their reported symptoms.
        2.  Identify 3-4 potential medical conditions that could explain these symptoms. For each condition, provide a simple, one-sentence description.
        3.  Recommend a single, most appropriate medical specialty for the user to consult for a professional diagnosis (e.g., "Cardiologist", "Neurologist", "Gastroenterologist", "General Practitioner"). Do not recommend talking to a doctor in general, be specific.
        
        IMPORTANT: Start your response with a clear disclaimer that you are an AI and not a medical professional, and that the user should consult a real doctor for any health concerns. Format your entire response as a JSON object that adheres to the provided output schema.`,
    });

    const result = await analysisPrompt({symptoms, age, gender});

    return result.output!;
  }
);

export type { Analysis } from '@/lib/types';

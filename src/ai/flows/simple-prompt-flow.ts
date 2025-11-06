'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * Defines a very simple AI flow that takes a string prompt
 * and returns a string response from the Gemini model.
 */
export const simplePromptFlow = ai.defineFlow(
  {
    name: 'simplePromptFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {

    const { text } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: prompt,
    });
    
    return text;
  }
);

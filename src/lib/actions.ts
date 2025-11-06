'use server';

import { simplePromptFlow } from '@/ai/flows/simple-prompt-flow';
import { z } from 'zod';

const PromptInputSchema = z.string().min(1, 'Prompt cannot be empty.');

/**
 * A simple server action that takes a text prompt, sends it to the AI,
 * and returns the AI's response as a string.
 * @param prompt The user's text prompt.
 * @returns A promise that resolves to the AI's text response.
 */
export async function getSimpleResponse(prompt: string): Promise<string> {
  try {
    const validatedPrompt = PromptInputSchema.parse(prompt);
    const response = await simplePromptFlow(validatedPrompt);
    return response;
  } catch (e: any) {
    console.error('Error in getSimpleResponse action:', e);
    // IMPORTANT: Always throw a new Error with a plain message.
    throw new Error(e.message || 'An unexpected error occurred while contacting the AI.');
  }
}

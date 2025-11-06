'use server';
import {
  analyzeSymptomsAndSuggestConditions,
} from '@/ai/flows/analyze-symptoms-and-suggest-conditions';
import type { Analysis } from '@/ai/flows/analyze-symptoms-and-suggest-conditions';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { Doctor, doctorSchema } from '@/lib/types';


const findDoctorsInputSchema = z.object({
  specialty: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export async function getAnalysis(
  symptoms: string,
  age: number,
  gender: 'male' | 'female' | 'other'
): Promise<Analysis> {
  console.log('getting analysis for', symptoms, age, gender);
  const analysis = await analyzeSymptomsAndSuggestConditions({
    symptoms,
    age,
    gender,
  });
  return analysis;
}

export async function findNearbyDoctors(
  specialty: string,
  latitude: number,
  longitude: number
): Promise<Doctor[]> {
  const validatedInput = findDoctorsInputSchema.parse({ specialty, latitude, longitude });

  const doctorsPrompt = ai.definePrompt({
    name: 'doctorsPrompt',
    input: { schema: findDoctorsInputSchema },
    output: { schema: z.array(doctorSchema) },
    prompt: `Find 5 real, highly-rated doctors, clinics, or hospitals near latitude {{latitude}} and longitude {{longitude}} that specialize in {{specialty}}. Include their real name, full address, a real phone number, and specialty. Also include the approximate distance from the provided coordinates in kilometers (e.g., "4 km"). Do not make up information.`,
  });

  const result = await doctorsPrompt(validatedInput);
  return result.output!;
}

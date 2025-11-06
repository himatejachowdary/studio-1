'use server';
import {
  analyzeSymptomsAndSuggestConditions,
  type Analysis,
} from '@/ai/flows/analyze-symptoms-and-suggest-conditions';
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
    prompt: `Find 3 real, highly-rated doctors or clinics near latitude {{latitude}} and longitude {{longitude}} that specialize in {{specialty}}. Include their real name, full address, and a real phone number. Do not make up information.`,
  });

  const result = await doctorsPrompt(validatedInput);
  return result.output!;
}

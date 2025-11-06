'use server';

import {
  analyzeSymptomsAndSuggestConditions,
  SymptomAnalysisInputSchema,
} from '@/ai/flows/analyze-symptoms-and-suggest-conditions';
import type { AnalysisInput, AnalysisResult, Diagnosis } from '@/lib/types';
import { getAuthenticatedAppForUser } from '@/lib/firebase-admin';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { User } from 'firebase/auth';

export async function getAnalysis(
  input: AnalysisInput
): Promise<AnalysisResult> {
  try {
    const validatedInput = SymptomAnalysisInputSchema.parse(input);
    const output = await analyzeSymptomsAndSuggestConditions(validatedInput);
    return {
      possibleConditions: output.possibleConditions,
      confidenceLevel: output.confidenceLevel,
      nextSteps: output.nextSteps,
      specialty: output.specialty,
    };
  } catch (e: any) {
    console.error('Error in getAnalysis action:', e);
    // Re-throw a plain Error object to ensure it's serializable.
    throw new Error(e.message || 'Failed to get analysis from the AI model.');
  }
}

export async function saveDiagnosis(
  input: AnalysisInput & AnalysisResult
): Promise<string> {
  const { firestore, currentUser } = await getAuthenticatedAppForUser();
  if (!currentUser) {
    throw new Error('User must be authenticated to save a diagnosis.');
  }

  const diagnosisData: Omit<Diagnosis, 'id'> = {
    ...input,
    userId: currentUser.uid,
    timestamp: new Date().toISOString(),
  };

  const docRef = await firestore
    .collection('users')
    .doc(currentUser.uid)
    .collection('diagnoses')
    .add(diagnosisData);
  return docRef.id;
}

const FindDoctorsInputSchema = z.object({
  specialty: z.string().describe('The medical specialty to search for.'),
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});

const DoctorSchema = z.object({
  name: z.string(),
  specialty: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  rating: z.number().optional(),
  website: z.string().optional(),
});

const FindDoctorsOutputSchema = z.object({
  doctors: z.array(DoctorSchema).describe('A list of recommended doctors.'),
  hospitals: z
    .array(DoctorSchema)
    .describe('A list of recommended hospitals.'),
});

export const findNearbyDoctorsFlow = ai.defineFlow(
  {
    name: 'findNearbyDoctorsFlow',
    inputSchema: FindDoctorsInputSchema,
    outputSchema: FindDoctorsOutputSchema,
  },
  async ({ specialty, latitude, longitude }) => {
    const prompt =
      specialty === 'Hospital'
        ? `You are a helpful emergency directory assistant. Find 5 highly-rated hospitals near the user's location. The user is at latitude ${latitude} and longitude ${longitude}.
           Return ONLY a list of hospital names and their phone numbers in the specified JSON format.`
        : `You are a helpful medical directory assistant. Find 5 highly-rated doctors for the specialty "${specialty}" and 3 hospitals near the user's location. The user is at latitude ${latitude} and longitude ${longitude}.
           Return the results in the specified JSON format. For each doctor and hospital, provide the name, specialty, full address, phone number, and a numerical rating. If a website is available, include it.`;

    const { output } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: prompt,
      output: {
        schema: FindDoctorsOutputSchema,
      },
    });

    if (!output) {
      throw new Error('Could not find nearby doctors.');
    }
    return output;
  }
);

export async function findNearbyDoctors(
  specialty: string,
  latitude: number,
  longitude: number
) {
  try {
    const result = await findNearbyDoctorsFlow({
      specialty,
      latitude,
      longitude,
    });
    return result;
  } catch (error: any) {
    console.error('Error in findNearbyDoctors action:', error);
    // Re-throw a plain Error object to ensure it's serializable.
    throw new Error(error.message || 'Could not fetch doctor data.');
  }
}

'use server';

import { analyzeSymptomsAndSuggestConditions } from "@/ai/flows/analyze-symptoms-and-suggest-conditions";
import { z } from "zod";
import type { AnalysisResult, Doctor } from "./types";
import { saveDiagnosis } from "./data";
import { getAuthenticatedAppForUser } from "@/lib/firebase-admin";
import { ai } from '@/ai/genkit';
import { DoctorSchema } from '@/lib/types';

const analysisSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
  medicalHistory: z.string().optional(),
  useMedicalHistory: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AnalysisAndDocsResult = AnalysisResult & { doctors: Doctor[] | null };

type FormState = {
    message: string;
    result: AnalysisAndDocsResult | null;
    error: string | null;
}

export async function getAnalysis(
  prevState: any,
  formData: FormData
): Promise<FormState> {

  const validatedFields = analysisSchema.safeParse({
    symptoms: formData.get('symptoms'),
    medicalHistory: formData.get('medicalHistory'),
    useMedicalHistory: formData.get('useMedicalHistory') === 'on',
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
  });
  
  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      result: null,
      error: validatedFields.error.flatten().fieldErrors.symptoms?.[0] || "Invalid input.",
    };
  }

  let analysisResult: Awaited<ReturnType<typeof analyzeSymptomsAndSuggestConditions>>;
  try {
    analysisResult = await analyzeSymptomsAndSuggestConditions({
      symptoms: validatedFields.data.symptoms,
      medicalHistory: validatedFields.data.medicalHistory,
      useMedicalHistory: validatedFields.data.useMedicalHistory,
    });
  } catch (e: any) {
    console.error("AI analysis failed:", e);
    return { 
        message: "Analysis failed", 
        result: null, 
        error: e.message || "An error occurred during analysis. Please try again.",
    };
  }
  
  let doctors: Doctor[] | null = null;
  // Use the first recommended department to find doctors
  const specialty = analysisResult.departments?.[0];

  if (validatedFields.data.latitude && validatedFields.data.longitude && specialty) {
      try {
        const doctorResult = await findNearbyDoctors({
            latitude: validatedFields.data.latitude,
            longitude: validatedFields.data.longitude,
            specialty: specialty,
        });
        doctors = doctorResult.doctors;
      } catch (e: any) {
        console.error("Doctor search failed:", e);
        // Don't block the user from seeing their analysis if doctor search fails
      }
  }


  const fullResult: AnalysisAndDocsResult = {
    ...analysisResult,
    doctors,
  }

  try {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (currentUser?.uid) {
       await saveDiagnosis(currentUser.uid, {
        ...analysisResult,
        symptoms: validatedFields.data.symptoms,
        medicalHistory: validatedFields.data.medicalHistory || '',
      });
      return {
          message: "Analysis complete and saved", 
          result: fullResult, 
          error: null,
      };
    }
  } catch(e: any) {
      console.warn("Could not save diagnosis to history. This is expected if the server is not configured for Firebase Admin.", e.message);
      return { 
        message: "Analysis complete, but failed to save to history.", 
        result: fullResult, 
        error: null,
    };
  }

  return {
    message: "Analysis complete",
    result: fullResult,
    error: null,
  }
}


const FindNearbyDoctorsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  specialty: z.string().describe('The medical specialty to search for.'),
});
export type FindNearbyDoctorsInput = z.infer<
  typeof FindNearbyDoctorsInputSchema
>;

const FindNearbyDoctorsOutputSchema = z.object({
  doctors: z
    .array(DoctorSchema)
    .describe('A list of nearby doctors or hospitals.'),
});
export type FindNearbyDoctorsOutput = z.infer<
  typeof FindNearbyDoctorsOutputSchema
>;

export async function findNearbyDoctors(
  input: FindNearbyDoctorsInput
): Promise<FindNearbyDoctorsOutput> {
  return findNearbyDoctorsFlow(input);
}

const findNearbyDoctorsPrompt = ai.definePrompt({
  name: 'findNearbyDoctorsPrompt',
  input: {schema: FindNearbyDoctorsInputSchema},
  output: {schema: FindNearbyDoctorsOutputSchema},
  model: 'gemini-1.5-flash',
  prompt: `You are a helpful assistant that finds doctors and hospitals.
Based on the user's location and the required specialty, find 3-5 relevant medical professionals or facilities.
Provide their name, specialty, address, latitude, and longitude.

User Location: {{latitude}}, {{longitude}}
Specialty Needed: {{{specialty}}}

Output in JSON format.
`,
});

const findNearbyDoctorsFlow = ai.defineFlow(
  {
    name: 'findNearbyDoctorsFlow',
    inputSchema: FindNearbyDoctorsInputSchema,
    outputSchema: FindNearbyDoctorsOutputSchema,
  },
  async input => {
    const {output} = await findNearbyDoctorsPrompt(input);
    return output!;
  }
);

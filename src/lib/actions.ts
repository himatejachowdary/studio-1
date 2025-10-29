'use server';

import { analyzeSymptomsAndSuggestConditions } from "@/ai/flows/analyze-symptoms-and-suggest-conditions";
import { z } from "zod";
import type { AnalysisResult } from "./types";
import { getAuthenticatedAppForUser } from "@/lib/firebase-admin";
import { saveDiagnosis } from "./data";

const schema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
  medicalHistory: z.string().optional(),
  useMedicalHistory: z.boolean().optional(),
});

type FormState = {
    message: string;
    result: AnalysisResult | null;
    error: string | null;
}

export async function getAnalysis(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const { firebaseApp, currentUser } = await getAuthenticatedAppForUser();
  if (!firebaseApp || !currentUser) {
    return {
      message: 'Authentication failed',
      result: null,
      error: 'You must be logged in to perform an analysis.'
    }
  }

  const validatedFields = schema.safeParse({
    symptoms: formData.get('symptoms'),
    medicalHistory: formData.get('medicalHistory'),
    useMedicalHistory: formData.get('useMedicalHistory') === 'on',
  });
  
  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      result: null,
      error: validatedFields.error.flatten().fieldErrors.symptoms?.[0] || "Invalid input.",
    };
  }

  try {
    const result = await analyzeSymptomsAndSuggestConditions(validatedFields.data);
    
    // Automatically save the analysis
    await saveDiagnosis(currentUser.uid, {
        ...result,
        symptoms: validatedFields.data.symptoms,
        medicalHistory: validatedFields.data.medicalHistory || '',
    });

    return {
        message: "Analysis complete and saved", 
        result, 
        error: null,
    };
  } catch (e) {
    console.error(e);
    return { 
        message: "Analysis failed", 
        result: null, 
        error: "An error occurred during analysis. Please try again.",
    };
  }
}

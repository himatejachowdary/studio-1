
'use server';

import { analyzeSymptomsAndSuggestConditions } from "@/ai/flows/analyze-symptoms-and-suggest-conditions";
import { z } from "zod";
import type { AnalysisResult } from "./types";
import { saveDiagnosis } from "./data";
import { getAuthenticatedAppForUser } from "@/lib/firebase-admin";

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

  let result: AnalysisResult;
  try {
    // We can still get the analysis even if the user isn't logged in or server is misconfigured
    result = await analyzeSymptomsAndSuggestConditions(validatedFields.data);
  } catch (e: any) {
    console.error("AI analysis failed:", e);
    return { 
        message: "Analysis failed", 
        result: null, 
        error: e.message || "An error occurred during analysis. Please try again.",
    };
  }
  
  try {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (currentUser?.uid) {
       // Attempt to save the analysis, but don't block the user if it fails
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
    } else {
       // This case means user is not logged in. We can still return the result.
       return {
          message: "Analysis complete",
          result,
          error: null,
       }
    }
  } catch(e: any) {
      console.error("Failed to save diagnosis:", e);
      // Return the result to the user even if saving failed, but log the error.
      // The most likely cause is a missing FIREBASE_SERVICE_ACCOUNT_KEY
      return { 
        message: "Analysis complete, but failed to save to history.", 
        result, 
        error: null, // We don't show this error to the user
    };
  }
}

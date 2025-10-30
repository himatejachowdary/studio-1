
'use server';

import { analyzeSymptomsAndSuggestConditions } from "@/ai/flows/analyze-symptoms-and-suggest-conditions";
import { z } from "zod";
import type { AnalysisResult } from "./types";
import { saveDiagnosis, generateTotpSecret } from "./data";
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
    // This function will throw an error if the server is not configured, which we catch below.
    const { currentUser } = await getAuthenticatedAppForUser();
    if (currentUser?.uid) {
       // Attempt to save the analysis.
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
    }
  } catch(e: any) {
      console.error("Failed to save diagnosis:", e);
      // This path is taken if the server environment is not configured.
      // We return the result to the user, but log the server-side error.
      return { 
        message: "Analysis complete, but failed to save to history.", 
        result, 
        error: null, // We don't show a blocking error to the user for this.
    };
  }

  // This case means the user is not logged in. We can still return the result.
  return {
    message: "Analysis complete",
    result,
    error: null,
  }
}

export async function getTotpSecret() {
    try {
        const { currentUser } = await getAuthenticatedAppForUser();
        if (!currentUser) {
            return { error: 'You must be logged in to set up MFA.' };
        }
        const secret = await generateTotpSecret(currentUser.uid);
        return { secret };
    } catch (e: any) {
        console.error('Error generating TOTP secret:', e);
        return { error: e.message || 'Failed to start MFA enrollment.' };
    }
}

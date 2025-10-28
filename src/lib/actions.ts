'use server';

import { analyzeSymptomsAndSuggestConditions } from "@/ai/flows/analyze-symptoms-and-suggest-conditions";
import { z } from "zod";
import type { AnalysisResult } from "./types";

const schema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
  medicalHistory: z.string().optional(),
  useMedicalHistory: z.boolean().optional(),
});

type FormState = {
    message: string;
    result: AnalysisResult | null;
    error: string | null;
    symptoms: string;
    medicalHistory: string;
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
      symptoms: formData.get('symptoms') as string || '',
      medicalHistory: formData.get('medicalHistory') as string || '',
    };
  }

  try {
    const result = await analyzeSymptomsAndSuggestConditions(validatedFields.data);
    return {
        message: "Analysis complete", 
        result, 
        error: null,
        symptoms: validatedFields.data.symptoms,
        medicalHistory: validatedFields.data.medicalHistory || '',
    };
  } catch (e) {
    return { 
        message: "Analysis failed", 
        result: null, 
        error: "An error occurred during analysis. Please try again.",
        symptoms: validatedFields.data.symptoms,
        medicalHistory: validatedFields.data.medicalHistory || '',
    };
  }
}

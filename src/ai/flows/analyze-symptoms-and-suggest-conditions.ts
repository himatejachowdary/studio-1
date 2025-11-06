'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const SymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('The symptoms the user is experiencing.'),
  medicalHistory: z
    .string()
    .optional()
    .describe('Any relevant medical history of the user.'),
});

export const SymptomAnalysisOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe(
      'A list of possible medical conditions, formatted as a comma-separated string.'
    ),
  confidenceLevel: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The confidence level of the diagnosis.'),
  nextSteps: z
    .string()
    .describe(
      'Recommended next steps for the user, such as "Consult a General Physician" or "Visit an Emergency Room".'
    ),
    specialty: z.string().describe("A single, most relevant medical specialty based on the symptoms (e.g., 'Cardiology', 'Dermatology', 'General Medicine')."),
});

const prompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: { schema: SymptomAnalysisInputSchema },
  output: { schema: SymptomAnalysisOutputSchema },
  prompt: `
        You are an expert AI medical assistant. A user will provide their symptoms and optionally their medical history.
        Based on this information, you must perform the following tasks:

        1.  **Analyze the Symptoms**: Carefully review the symptoms provided.
        2.  **Identify Possible Conditions**: Determine a list of the most likely medical conditions that match the symptoms. Return this as a comma-separated string.
        3.  **Determine Confidence Level**: Assess your confidence in this analysis (High, Medium, or Low).
        4.  **Recommend Next Steps**: Suggest clear, actionable next steps for the user.
        5.  **Suggest a Specialty**: Identify the single most appropriate medical specialty for the user to consult.

        **IMPORTANT RULES**:
        - NEVER suggest specific medications.
        - Your analysis should be based solely on the information provided.
        - Prioritize user safety. If symptoms are severe (e.g., chest pain, difficulty breathing), recommend immediate medical attention.

        **User Input**:
        - Symptoms: {{{symptoms}}}
        - Medical History: {{{medicalHistory}}}
    `,
});

export const analyzeSymptomsAndSuggestConditions = ai.defineFlow(
  {
    name: 'analyzeSymptomsAndSuggestConditions',
    inputSchema: SymptomAnalysisInputSchema,
    outputSchema: SymptomAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, {model: 'gemini-1.5-flash'});
    if (!output) {
      throw new Error('Analysis failed to generate a result.');
    }
    return output;
  }
);

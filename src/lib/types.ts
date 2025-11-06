import { z } from 'zod';

export const conditionSchema = z.object({
  name: z.string().describe('The common name of the medical condition.'),
  description: z.string().describe('A brief, easy-to-understand description of the condition.'),
});
export type Condition = z.infer<typeof conditionSchema>;

export const analysisSchema = z.object({
  summary: z.string().describe("A brief summary of the user's symptoms and general situation."),
  potentialConditions: z.array(conditionSchema).describe('A list of potential medical conditions that could explain the symptoms.'),
  recommendedSpecialty: z.string().describe('The medical specialty best suited to address these symptoms (e.g., "Cardiologist", "Neurologist", "General Practitioner").'),
});
export type Analysis = z.infer<typeof analysisSchema>;

export const doctorSchema = z.object({
  name: z.string(),
  specialty: z.string().optional(),
  address: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().optional(),
  distance: z.string().optional(),
});
export type Doctor = z.infer<typeof doctorSchema>;

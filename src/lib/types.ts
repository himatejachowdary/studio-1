import { z } from 'zod';

export type AnalysisResult = {
  diagnosis: {
    name: string;
    explanation: string;
  }[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  departments: string[];
};

export const DoctorSchema = z.object({
  name: z.string().describe('The name of the doctor or hospital.'),
  specialty: z
    .string()
    .describe('The medical specialty of the doctor or facility.'),
  address: z.string().describe('The full address of the location.'),
  distance: z
    .string()
    .optional()
    .describe('The distance from the user.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});

export type Doctor = z.infer<typeof DoctorSchema>;

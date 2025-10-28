import { config } from 'dotenv';
config();

import '@/ai/flows/interpret-natural-language-input.ts';
import '@/ai/flows/analyze-symptoms-and-suggest-conditions.ts';
import '@/ai/flows/incorporate-medical-history-for-diagnosis.ts';
import '@/ai/flows/find-nearby-doctors.ts';

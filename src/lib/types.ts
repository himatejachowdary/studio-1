
export type AnalysisInput = {
    symptoms: string;
    medicalHistory?: string;
};

export type AnalysisResult = {
    possibleConditions: string;
    confidenceLevel: string;
    nextSteps: string;
    specialty: string;
};

export type Diagnosis = AnalysisInput & AnalysisResult & {
    id: string;
    userId: string;
    timestamp: string;
};

export type Doctor = {
    name: string;
    specialty: string;
    address: string;
    phone: string;
    rating: number;
    website?: string;
};

export type NearbyDoctorResult = {
    doctors: Doctor[];
    hospitals: Doctor[];
}

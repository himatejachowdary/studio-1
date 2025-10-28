export type AnalysisResult = {
  possibleConditions: string;
  confidenceLevel: string;
  nextSteps: string;
};

export type Doctor = {
  name: string;
  specialty: string;
  address: string;
  distance: string;
};

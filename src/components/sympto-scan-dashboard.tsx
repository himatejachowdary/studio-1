'use client';
import { useState } from 'react';
import { User } from 'firebase/auth';
import { SymptomAnalyzer } from '@/components/symptom-analyzer';
import { AnalysisResults } from '@/components/analysis-results';
import { DoctorRecommendations } from '@/components/doctor-recommendations';
import { getAnalysis, saveDiagnosis, findNearbyDoctors } from '@/lib/actions';
import type { AnalysisInput, AnalysisResult } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

type DashboardState = 'idle' | 'analyzing' | 'results';

export function SymptoScanDashboard({ user }: { user: User }) {
  const [state, setState] = useState<DashboardState>('idle');
  const [analysisInput, setAnalysisInput] = useState<AnalysisInput | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recommendationSpecialty, setRecommendationSpecialty] = useState<string>('');

  const handleAnalysisStart = () => {
    setState('analyzing');
    setAnalysisResult(null);
    setAnalysisInput(null);
  };

  const handleAnalysisComplete = (
    input: AnalysisInput,
    result: AnalysisResult
  ) => {
    setAnalysisInput(input);
    setAnalysisResult(result);
    setRecommendationSpecialty(result.specialty);
    setState('results');
    // Save the diagnosis to Firestore without blocking the UI
    saveDiagnosis({ ...input, ...result });
  };

  const handleAnalysisError = (error: string) => {
    console.error('Analysis error:', error);
    setState('idle'); // Or a new 'error' state
  };
  
  const handleStartNewAnalysis = () => {
    setState('idle');
    setAnalysisResult(null);
    setAnalysisInput(null);
    setRecommendationSpecialty('');
  }

  const handleEmergencyClick = () => {
    // Immediately switch to recommendations tab with "Hospital" specialty
    setRecommendationSpecialty('Hospital');
    // Ensure we are on the results screen to show the recommendations
    if (state !== 'results') {
        setState('results');
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <AnimatePresence mode="wait">
        {state === 'idle' && (
             <motion.div
             key="analyzer"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
           >
            <div className="max-w-2xl mx-auto">
                <SymptomAnalyzer
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                    getAnalysisAction={getAnalysis}
                />
            </div>
          </motion.div>
        )}

        {state === 'analyzing' && (
            <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
            >
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                         <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary/60"></div>
                         </div>
                    </div>
                    <p className="text-muted-foreground font-semibold">AI is analyzing your symptoms...</p>
                </div>
            </motion.div>
        )}

        {state === 'results' && (
            <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {analysisResult && (
                <>
                    <AnalysisResults results={analysisResult} />
                </>
            )}
            {recommendationSpecialty && (
                <DoctorRecommendations 
                    specialty={recommendationSpecialty} 
                    onEmergencyClick={handleEmergencyClick}
                    findNearbyDoctorsAction={findNearbyDoctors}
                />
            )}
             <div className="text-center">
                <Button onClick={handleStartNewAnalysis}>Start New Analysis</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SymptomAnalyzer from './symptom-analyzer';
import SymptomAnalysis from './symptom-analysis';
import DoctorRecommendations from './doctor-recommendations';
import { Analysis, Doctor } from '@/lib/types';
import { findNearbyDoctors } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

type AppState = 'idle' | 'analyzing' | 'analysis_complete' | 'finding_doctors' | 'doctors_found';

const SymptoScanDashboard = () => {
  const [state, setState] = useState<AppState>('idle');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (analysis: Analysis) => {
    setAnalysis(analysis);
    setState('analysis_complete');
    setError(null);
  };

  const handleFindDoctors = async (specialty: string) => {
    setState('finding_doctors');
    setError(null);
    
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const foundDoctors = await findNearbyDoctors(specialty, latitude, longitude);
          setDoctors(foundDoctors);
          setState('doctors_found');
        } catch (err: any) {
            handleAnalysisError(err.message);
        }
      },
      (error) => {
        handleAnalysisError('Could not get location. Please enable location services.');
      }
    );
  };
  
  const handleAnalysisError = (error: string) => {
    console.error('Analysis error:', error);
    setState('idle'); // Or a new 'error' state
  };
  

  const handleStartNewAnalysis = () => {
    setState('idle');
    setAnalysis(null);
    setDoctors(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="analyzer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SymptomAnalyzer
              onAnalysisStart={() => setState('analyzing')}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleAnalysisError}
            />
          </motion.div>
        )}

        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 p-8"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Analyzing your symptoms...</p>
          </motion.div>
        )}

        {(state === 'analysis_complete' || state === 'finding_doctors' || state === 'doctors_found') && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SymptomAnalysis analysis={analysis} onFindDoctors={handleFindDoctors} isFindingDoctors={state === 'finding_doctors'} />
            
            {state === 'finding_doctors' && (
                <div className="flex flex-col items-center justify-center space-y-4 p-8 mt-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-md text-muted-foreground">Finding nearby specialists...</p>
                </div>
            )}

            {state === 'doctors_found' && doctors && (
                <DoctorRecommendations doctors={doctors} />
            )}
             <div className="text-center mt-8">
                <button className="text-primary hover:underline" onClick={handleStartNewAnalysis}>Start New Analysis</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymptoScanDashboard;

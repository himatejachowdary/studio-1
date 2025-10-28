'use client';

import { useState } from 'react';
import { SymptomAnalyzer } from './symptom-analyzer';
import { AnalysisResults } from './analysis-results';
import { DoctorRecommendations } from './doctor-recommendations';
import { MapView } from './map-view';
import type { AnalysisResult, Doctor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, DatabaseZap } from 'lucide-react';

export function SymptoScanDashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSosSearch = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    // Simulate an analysis for "Emergency" to trigger doctor search
    const emergencyAnalysis: AnalysisResult = {
      possibleConditions: 'Emergency Care',
      confidenceLevel: 'High',
      nextSteps: 'Seek immediate medical attention.',
    };
    setAnalysisResult(emergencyAnalysis);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <SymptomAnalyzer
            onAnalysisUpdate={(res) => {
              setAnalysisResult(res);
              if(res) setError(null);
            }}
            onLoadingChange={setIsLoading}
            onErrorChange={setError}
            onSos={handleSosSearch}
          />
           <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <DatabaseZap className="w-6 h-6 text-primary" />
              <CardTitle className="font-headline">Data Backup Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                    To provide long-term value, we can securely store your symptom history and analysis results.
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Secure Storage:</strong> Use a database like Firebase Firestore to save each analysis.</li>
                    <li><strong>User History:</strong> Allow you to view past symptom checks and AI suggestions.</li>
                    <li><strong>Data Privacy:</strong> All data would be private and associated only with your account.</li>
                </ul>
                 <p className="font-semibold text-foreground/80">
                    This would allow for better tracking of your health over time.
                </p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-8">
          <AnalysisResults analysis={analysisResult} isLoading={isLoading} error={error} />
          { (analysisResult || isLoading) && (
              <>
                <DoctorRecommendations 
                  analysis={analysisResult} 
                  onDoctorsFound={setDoctors} 
                  isLoading={isLoading} 
                />
                <MapView doctors={doctors} />
              </>
          )}
        </div>
      </div>
    </div>
  );
}

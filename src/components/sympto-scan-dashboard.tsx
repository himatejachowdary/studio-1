'use client';

import { useState } from 'react';
import { SymptomAnalyzer } from './symptom-analyzer';
import { AnalysisResults } from './analysis-results';
import { DoctorRecommendations } from './doctor-recommendations';
import { MapView } from './map-view';
import type { AnalysisResult, Doctor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Brain, DatabaseZap, Save, History } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SymptoScanDashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symptomData, setSymptomData] = useState<{symptoms: string, medicalHistory?: string} | null>(null);


  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAnalysis = (res: AnalysisResult | null, data: {symptoms: string, medicalHistory?: string}) => {
    setAnalysisResult(res);
    setSymptomData(data);
    if(res) setError(null);
  }

  const handleSaveAnalysis = async () => {
    if (!user || !firestore || !analysisResult || !symptomData) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in and have an analysis to save.",
      });
      return;
    }

    const diagnosisData = {
        ...analysisResult,
        ...symptomData,
        timestamp: serverTimestamp()
    };
    
    const diagnosesColRef = collection(firestore, `users/${user.uid}/diagnoses`);
    addDocumentNonBlocking(diagnosesColRef, diagnosisData);

    toast({
      title: "Analysis Saved",
      description: "Your symptom analysis has been saved to your history.",
    });
  };


  const handleSosSearch = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
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
            onAnalysisUpdate={handleAnalysis}
            onLoadingChange={setIsLoading}
            onErrorChange={setError}
            onSos={handleSosSearch}
          />
           <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <DatabaseZap className="w-6 h-6 text-primary" />
              <CardTitle className="font-headline">Your Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                    Your symptom analyses can be securely stored in your personal health record.
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Secure Storage:</strong> We use Firestore to save each analysis under your account.</li>
                    <li><strong>View History:</strong> You can view past symptom checks at any time.</li>
                    <li><strong>Data Privacy:</strong> All data is private to your account.</li>
                </ul>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
                 <Button onClick={handleSaveAnalysis} disabled={!analysisResult || isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Current Analysis
                </Button>
                <Button asChild variant="outline">
                    <Link href="/history">
                        <History className="mr-2 h-4 w-4" />
                        View Full History
                    </Link>
                </Button>
            </CardFooter>
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

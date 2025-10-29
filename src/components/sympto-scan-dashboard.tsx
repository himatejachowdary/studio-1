'use client';

import { useState } from 'react';
import { SymptomAnalyzer } from './symptom-analyzer';
import { AnalysisResults } from './analysis-results';
import { DoctorRecommendations } from './doctor-recommendations';
import { MapView } from './map-view';
import type { AnalysisResult, Doctor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DatabaseZap, History, User } from 'lucide-react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';


export function SymptoScanDashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isUserLoading } = useUser();

  const handleAnalysis = (res: AnalysisResult | null) => {
    setAnalysisResult(res);
    if(res) setError(null);
  }

  const handleSosSearch = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    const emergencyAnalysis: AnalysisResult = {
      possibleConditions: 'Emergency Care',
      confidenceLevel: 'High',
      nextSteps: 'Seek immediate medical attention. We are locating the nearest hospitals for you.',
    };
    setAnalysisResult(emergencyAnalysis);
    setIsLoading(false);
  };

  const userIdentifier = user?.email || user?.phoneNumber || "Welcome";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
       <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">SymptoScan Dashboard</h1>
            <div className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4"/> 
                {isUserLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <p>Signed in as: <span className="font-medium">{userIdentifier}</span></p>
                )}
            </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <SymptomAnalyzer
            onAnalysisUpdate={handleAnalysis}
            onLoadingChange={setIsLoading}
            onErrorChange={setError}
            onSos={handleSosSearch}
            isUserLoggedIn={!!user}
          />
           <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <DatabaseZap className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="font-headline">Your Medical Record</CardTitle>
                        <CardDescription>View your analysis history, saved securely.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                    Your symptom analyses are now automatically and securely stored in your personal health record.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Automatic & Secure:</strong> Each analysis is saved under your private user account.</li>
                    <li><strong>View History:</strong> Access past checks anytime from the history page.</li>
                </ul>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                <Button asChild>
                    <Link href="/history">
                        <History />
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

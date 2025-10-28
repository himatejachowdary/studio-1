'use client';

import { useState } from 'react';
import { SymptomAnalyzer } from './symptom-analyzer';
import { AnalysisResults } from './analysis-results';
import { DoctorRecommendations } from './doctor-recommendations';
import { MapView } from './map-view';
import type { AnalysisResult } from '@/lib/types';

export function SymptoScanDashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-8">
          <AnalysisResults analysis={analysisResult} isLoading={isLoading} error={error} />
          { (analysisResult || isLoading) && (
              <>
                <DoctorRecommendations analysis={analysisResult} />
                <MapView />
              </>
          )}
        </div>
      </div>
    </div>
  );
}

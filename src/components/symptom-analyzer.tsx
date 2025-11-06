'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, AlertTriangle, Sparkles } from 'lucide-react';
import type { AnalysisInput, AnalysisResult } from '@/lib/types';

const analyzerSchema = z.object({
  symptoms: z.string().min(10, 'Please describe your symptoms in more detail (at least 10 characters).'),
  medicalHistory: z.string().optional(),
});

type AnalyzerFormValues = z.infer<typeof analyzerSchema>;

type SymptomAnalyzerProps = {
  onAnalysisStart: () => void;
  onAnalysisComplete: (input: AnalysisInput, result: AnalysisResult) => void;
  onAnalysisError: (error: string) => void;
  getAnalysisAction: (input: AnalysisInput) => Promise<AnalysisResult>;
};

export function SymptomAnalyzer({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  getAnalysisAction,
}: SymptomAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzerFormValues>({
    resolver: zodResolver(analyzerSchema),
  });

  const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Geolocation not supported, resolve with null
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            // User denied permission or other error, resolve with null
            resolve(null);
          }
        );
      }
    });
  };

  const handleAnalysisSubmit = async (data: AnalyzerFormValues) => {
    setIsLoading(true);
    setError(null);
    onAnalysisStart();
    
    const locationData = await getLocation();
    
    const analysisInput: AnalysisInput = {
      ...data,
      ...(locationData || {}),
    };
    
    if (!locationData) {
        setError('Could not get location. Analysis will proceed without location data, which may affect accuracy.');
    }

    try {
      const result = await getAnalysisAction(analysisInput);
      onAnalysisComplete(analysisInput, result);
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during analysis.';
      setError(errorMessage);
      onAnalysisError(errorMessage);
      setIsLoading(false); // Stop loading on error
    } 
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Symptom Analysis</CardTitle>
        <CardDescription>
          Enter your symptoms and any relevant medical history below. Our AI will
          provide a preliminary analysis. For better results, allow access to your location.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleAnalysisSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant={error.includes('location') ? 'default' : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{error.includes('location') ? 'Location Warning' : 'Analysis Failed'}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="e.g., 'I have a high fever, a sore throat, and feel very tired...'"
              {...register('symptoms')}
              rows={5}
              disabled={isLoading}
            />
            {errors.symptoms && (
              <p className="text-sm text-destructive">{errors.symptoms.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
            <Textarea
              id="medicalHistory"
              placeholder="e.g., 'I have a history of asthma and am allergic to penicillin...'"
              {...register('medicalHistory')}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            Analyze My Symptoms
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

'use client';

import { Building, MapPin, User, ShieldCheck, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Doctor, AnalysisResult } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

type Props = {
  analysis: (AnalysisResult & { doctors: Doctor[] | null }) | null;
  doctors: Doctor[] | null;
  isLoading: boolean;
};

export function DoctorRecommendations({ analysis, doctors, isLoading: analysisLoading }: Props) {
  
  const isSos = analysis?.departments.includes('Emergency');

  const renderContent = () => {
    if (analysisLoading) {
      return (
         <div className="space-y-4 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
           <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      )
    }

    if (!analysis) {
      return (
        <div className="text-center p-8 border-dashed border-transparent">
          <div className="mx-auto bg-secondary rounded-full p-3 w-fit">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">
            Complete your symptom analysis to see relevant doctor recommendations here.
          </p>
        </div>
      );
    }

    if (!doctors || doctors.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          <span>No {isSos ? 'hospitals' : 'doctors'} found for the given criteria.</span>
        </div>
      )
    }
    
    return (
      <ul className="space-y-4">
        {doctors.map((doctor, index) => (
          <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background rounded-full">
                  <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{doctor.name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              </div>
            </div>
            <div className="text-right">
              {doctor.distance && <p className="font-semibold text-sm">{doctor.distance}</p>}
              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 max-w-xs truncate">
                  <MapPin className="w-3 h-3"/>
                  {doctor.address}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };
  
  const cardTitle = isSos ? 'Nearby Hospitals' : analysis ? 'Recommended Doctors' : 'Doctor Suggestions';
  const cardDescription = isSos 
    ? 'Emergency services near you' 
    : analysis 
    ? `Based on your analysis for: ${analysis.diagnosis[0].name}`
    : undefined;


  return (
    <Card className="h-full flex flex-col">
       <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline">{cardTitle}</CardTitle>
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
            </div>
            <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {renderContent()}
      </CardContent>
       {doctors && doctors.length > 0 &&
        <CardFooter className="flex-col items-stretch gap-2">
          <Button className="w-full" variant="outline">View all {isSos ? 'hospitals' : 'doctors'}</Button>
        </CardFooter>
      }
    </Card>
  );
}

'use client';

import { Building, MapPin, User, ShieldCheck, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Doctor, AnalysisResult } from '@/lib/types';
import { useEffect, useState } from 'react';
import { findNearbyDoctors } from '@/ai/flows/find-nearby-doctors';

type Props = {
  analysis: AnalysisResult | null;
  onDoctorsFound: (doctors: Doctor[] | null) => void;
  isLoading: boolean;
};

export function DoctorRecommendations({ analysis, onDoctorsFound, isLoading: analysisLoading }: Props) {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysis && analysis.possibleConditions) {
      const fetchDoctors = async (latitude: number, longitude: number) => {
        setIsFetching(true);
        setError(null);
        try {
          const specialty = analysis.possibleConditions.split(',')[0].trim();
          const result = await findNearbyDoctors({ latitude, longitude, specialty });
          setDoctors(result.doctors);
          onDoctorsFound(result.doctors);
        } catch (e) {
          setError('Could not fetch doctor recommendations. Please try again.');
          console.error(e);
          onDoctorsFound(null);
        } finally {
          setIsFetching(false);
        }
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchDoctors(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Location access is required to find nearby doctors.');
          // Fallback to default location for demo purposes
          fetchDoctors(28.6139, 77.2090); 
        }
      );
    } else {
        setDoctors(null);
        onDoctorsFound(null);
    }
  }, [analysis, onDoctorsFound]);

  const renderContent = () => {
    if (analysisLoading) {
      return (
         <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          <span>Waiting for analysis...</span>
        </div>
      )
    }

    if (isFetching) {
      return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          <span>Finding nearby doctors...</span>
        </div>
      );
    }
    
    if (error) {
        return <p className="text-destructive p-4">{error}</p>
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
      return <p className="text-muted-foreground p-4">No doctors found for the given criteria.</p>;
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
  
  const cardTitle = analysis ? 'Recommended Doctors' : 'Doctor Suggestions';
  const cardDescription = analysis ? `Based on your analysis for: ${analysis.possibleConditions.split(',')[0]}` : undefined;

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
        <CardFooter>
          <Button className="w-full" variant="outline">View all doctors</Button>
        </CardFooter>
      }
    </Card>
  );
}

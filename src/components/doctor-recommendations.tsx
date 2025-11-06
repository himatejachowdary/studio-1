'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  Loader,
  AlertTriangle,
  Stethoscope,
  Building,
  User,
  Star,
  Phone,
  Globe,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import type { NearbyDoctorResult, Doctor } from '@/lib/types';
import { MapView } from './map-view';

type DoctorRecommendationsProps = {
  specialty: string;
  onEmergencyClick: () => void;
  findNearbyDoctorsAction: (
    specialty: string,
    lat: number,
    lng: number
  ) => Promise<NearbyDoctorResult>;
};

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
            <span className='flex items-center gap-2'><User /> {doctor.name}</span>
            <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" /> {doctor.rating}
            </Badge>
        </CardTitle>
        <CardDescription>{doctor.specialty}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0"/> {doctor.address}</p>
        <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {doctor.phone}</p>
        {doctor.website && <p className="flex items-center gap-2"><Globe className="w-4 h-4"/> <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{doctor.website}</a></p>}
      </CardContent>
    </Card>
);

export function DoctorRecommendations({
  specialty,
  onEmergencyClick,
  findNearbyDoctorsAction,
}: DoctorRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NearbyDoctorResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Could not get your location. Please enable location services in your browser.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation && specialty) {
      setIsLoading(true);
      setError(null);
      findNearbyDoctorsAction(specialty, userLocation.lat, userLocation.lng)
        .then((res) => {
          setResults(res);
        })
        .catch((err) => {
          setError(err.message || 'Could not fetch doctor data. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userLocation, specialty, findNearbyDoctorsAction]);

  const markers = useMemo(() => {
    if (!results) return [];
    const doctorMarkers = results.doctors.map(d => ({ key: d.name, label: d.name, specialty: d.specialty }));
    const hospitalMarkers = results.hospitals.map(h => ({ key: h.name, label: h.name, specialty: "Hospital" }));
    return [...doctorMarkers, ...hospitalMarkers];
  }, [results]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
          <Loader className="animate-spin" />
          <p>Finding nearby doctors for "{specialty}"...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!results || (results.doctors.length === 0 && results.hospitals.length === 0)) {
      return (
        <Alert className="m-4">
            <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            Could not find any doctors or hospitals for the specialty "{specialty}" near you.
          </AlertDescription>
        </Alert>
      );
    }

    return (
        <Tabs defaultValue="doctors">
            <div className='px-6'>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="doctors"><Stethoscope />Doctors ({results.doctors.length})</TabsTrigger>
                    <TabsTrigger value="hospitals"><Building />Hospitals ({results.hospitals.length})</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="doctors" className="p-2 pt-0 md:p-6 md:pt-0">
                <div className='grid gap-4 md:grid-cols-2'>
                    {results.doctors.map((doctor, index) => <DoctorCard key={index} doctor={doctor} />)}
                </div>
            </TabsContent>
            <TabsContent value="hospitals" className="p-2 pt-0 md:p-6 md:pt-0">
                <div className='grid gap-4 md:grid-cols-2'>
                    {results.hospitals.map((hospital, index) => <DoctorCard key={index} doctor={hospital} />)}
                </div>
            </TabsContent>
      </Tabs>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor & Hospital Recommendations</CardTitle>
        <CardDescription>
          Here are AI-powered recommendations for the specialty: <Badge>{specialty}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userLocation && <MapView lat={userLocation.lat} lng={userLocation.lng} markers={markers} />}
        {renderContent()}
      </CardContent>
      <CardContent>
        <Alert variant="destructive">
            <HeartPulse className='w-4 h-4' />
            <AlertTitle>Emergency?</AlertTitle>
            <AlertDescription>
                <p>If this is a medical emergency, please dial your local emergency number immediately.</p>
                <Button onClick={onEmergencyClick} variant="destructive" size="sm" className="mt-2">Show Nearby Hospitals</Button>
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

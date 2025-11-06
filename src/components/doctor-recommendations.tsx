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

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
            <span className='flex items-center gap-2'><User /> {doctor.name}</span>
            {doctor.rating > 0 && <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" /> {doctor.rating}
            </Badge>}
        </CardTitle>
        <CardDescription>{doctor.specialty}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0"/> {doctor.address}</p>
        {doctor.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> <a href={`tel:${doctor.phone}`} className="text-primary hover:underline">{doctor.phone}</a></p>}
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
    // This effect runs once to get the user's location.
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
    // This effect runs when the location or specialty changes.
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
    // Ensure we have location data before creating markers with pseudo-locations
    if (!userLocation) return [];

    const doctorMarkers = results.doctors.map(d => ({ key: d.name, label: d.name, specialty: d.specialty, lat: userLocation.lat, lng: userLocation.lng }));
    const hospitalMarkers = results.hospitals.map(h => ({ key: h.name, label: h.name, specialty: "Hospital", lat: userLocation.lat, lng: userLocation.lng }));
    
    return [...doctorMarkers, ...hospitalMarkers];
  }, [results, userLocation]);


  const renderContent = () => {
    if (isLoading && !results) { // Only show initial loader if there are no stale results
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
          <Loader className="animate-spin" />
          <p>Finding nearby {specialty.toLowerCase() === 'hospital' ? 'hospitals' : `doctors for "${specialty}"`}...</p>
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
        <Tabs defaultValue={specialty === 'Hospital' ? "hospitals" : "doctors"}>
            <div className='px-6'>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="doctors" disabled={results.doctors.length === 0}><Stethoscope />Doctors ({results.doctors.length})</TabsTrigger>
                    <TabsTrigger value="hospitals" disabled={results.hospitals.length === 0}><Building />Hospitals ({results.hospitals.length})</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="doctors" className="p-2 pt-0 md:p-6 md:pt-0">
                <div className='grid gap-4 md:grid-cols-2'>
                    {results.doctors.length > 0 ? results.doctors.map((doctor, index) => <DoctorCard key={`doc-${index}`} doctor={doctor} />) : <p className='text-muted-foreground text-center col-span-2 p-4'>No doctors found for this specialty.</p>}
                </div>
            </TabsContent>
            <TabsContent value="hospitals" className="p-2 pt-0 md:p-6 md:pt-0">
                <div className='grid gap-4 md:grid-cols-2'>
                     {results.hospitals.length > 0 ? results.hospitals.map((hospital, index) => <DoctorCard key={`hosp-${index}`} doctor={hospital} />) : <p className='text-muted-foreground text-center col-span-2 p-4'>No hospitals found.</p>}
                </div>
            </TabsContent>
      </Tabs>
    );
  };

  return (
    <Card>
      <CardHeader className='flex-row justify-between items-center'>
        <div>
            <CardTitle>Doctor & Hospital Recommendations</CardTitle>
            <CardDescription>
            {specialty !== 'Hospital' && <>Recommendations for the specialty: <Badge>{specialty}</Badge></>}
            {specialty === 'Hospital' && <>Displaying nearby hospitals for emergency.</>}
            </CardDescription>
        </div>
        {isLoading && <Loader className="animate-spin text-primary" />}
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

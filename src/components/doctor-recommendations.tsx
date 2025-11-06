'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Doctor } from '@/lib/types';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type DoctorRecommendationsProps = {
  doctors: Doctor[];
  analysisCondition: string;
};

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
  <Card className="bg-primary/5 border-primary/20">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{doctor.name}</h3>
          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
          <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{doctor.address}</span>
          </div>
        </div>
        {doctor.distance && (
          <p className="text-sm font-semibold text-primary">{doctor.distance}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const MapView = ({ doctors }: { doctors: Doctor[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
    });

    loader.load().then(async () => {
      const { Map } = (await google.maps.importLibrary(
        'maps'
      )) as google.maps.MapsLibrary;
      const geocoder = new google.maps.Geocoder();

      if (mapRef.current) {
        const newMap = new Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 12,
          disableDefaultUI: true,
        });
        setMap(newMap);

        const bounds = new google.maps.LatLngBounds();

        doctors.forEach((doctor) => {
          geocoder.geocode({ address: doctor.address }, (results, status) => {
            if (status === 'OK' && results) {
              new google.maps.Marker({
                map: newMap,
                position: results[0].geometry.location,
                title: doctor.name,
              });
              bounds.extend(results[0].geometry.location);
              newMap.fitBounds(bounds);
            }
          });
        });
      }
    });
  }, [doctors]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '300px' }}
      className="rounded-lg shadow-md"
    />
  );
};

const DoctorRecommendations = ({
  doctors,
  analysisCondition,
}: DoctorRecommendationsProps) => {
  return (
    <div className="mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-serif">
                Recommended Doctors
              </CardTitle>
              <CardDescription>
                Based on your analysis for: {analysisCondition}
              </CardDescription>
            </div>
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.slice(0, 3).map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </div>

          {doctors.length > 3 && (
            <div className="mt-6 text-center">
              <Button variant="outline">View all doctors</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRecommendations;

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Doctor } from '@/lib/types';
import { Building, Phone, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type DoctorRecommendationsProps = {
  doctors: Doctor[];
};

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
  <Card className="flex flex-col justify-between">
    <CardHeader>
      <CardTitle className='text-xl'>{doctor.name}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className='w-4 h-4' />
            <span>{doctor.address}</span>
        </div>
        {doctor.phone && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className='w-4 h-4' />
                <span>{doctor.phone}</span>
            </div>
        )}
       {doctor.rating && (
         <div className="flex items-center gap-1">
          <Badge variant="secondary">{doctor.rating}</Badge>
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>
       )}
    </CardContent>
  </Card>
);

const MapView = ({ doctors }: { doctors: Doctor[] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            version: "weekly",
        });

        loader.load().then(async () => {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const geocoder = new google.maps.Geocoder();
            
            if (mapRef.current) {
                const newMap = new Map(mapRef.current, {
                    center: { lat: 0, lng: 0 },
                    zoom: 12,
                });
                setMap(newMap);

                const bounds = new google.maps.LatLngBounds();

                doctors.forEach(doctor => {
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

    return <div ref={mapRef} style={{ width: '100%', height: '400px' }} className='rounded-lg shadow-md' />;
};


const DoctorRecommendations = ({ doctors }: DoctorRecommendationsProps) => {
  return (
    <div className="mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Recommended Specialists</CardTitle>
          <CardDescription>
            Here are some specialists in your area who can help.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className='mb-6'>
                <MapView doctors={doctors} />
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRecommendations;

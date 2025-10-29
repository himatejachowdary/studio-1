'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Doctor } from '@/lib/types';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

type MapStatus = 'loading' | 'loaded' | 'error' | 'denied';

type Props = {
  doctors?: Doctor[] | null;
}

export function MapView({ doctors }: Props) {
  const [status, setStatus] = useState<MapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let isMounted = true;

    if (!GOOGLE_MAPS_API_KEY) {
      setStatus('error');
      setErrorMessage("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.");
      return;
    }
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserPosition(pos);
            setCenter(pos);
            setStatus('loaded');
          }
        },
        (error) => {
          if (isMounted) {
            if (error.code === error.PERMISSION_DENIED) {
              setStatus('denied');
              setErrorMessage('Location access denied. Showing default location.');
            } else {
              setStatus('error');
              setErrorMessage('Could not retrieve your location. Showing default.');
            }
            // Fallback to default, status will be updated to loaded once map is ready
            setStatus('loaded');
          }
        }
      );
    } else {
      if (isMounted) {
        setStatus('error');
        setErrorMessage('Geolocation is not supported. Showing default location.');
        setStatus('loaded'); // Still load the map at default location
      }
    }

    return () => {
      isMounted = false;
    };
  }, [GOOGLE_MAPS_API_KEY]);

  const renderContent = () => {
    if (!GOOGLE_MAPS_API_KEY || status === 'error' || status === 'denied') {
        const title = status === 'denied' ? "Location Access Denied" : "Map Error";
        return (
             <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
                    <AlertTriangle className="w-8 h-8 mb-4" />
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-center">{errorMessage}</p>
                </div>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading Map & Getting Location...</p>
                </div>
            </div>
        );
    }
    
    return null; // Map is ready to be shown
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <CardTitle className="font-headline">Nearby Medical Centers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
            {renderContent()}
            {status === 'loaded' && GOOGLE_MAPS_API_KEY && (
                 <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                        zoom={12}
                        center={center}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        mapId="symptoscan-map"
                    >
                      {userPosition && (
                          <AdvancedMarker position={userPosition} title="Your Location" />
                      )}
                      {doctors?.map((doctor, index) => (
                          <AdvancedMarker key={index} position={{ lat: doctor.lat, lng: doctor.lng }} title={doctor.name}>
                              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                H
                              </div>
                          </AdvancedMarker>
                      ))}
                    </Map>
                 </APIProvider>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, AlertTriangle, Hospital } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Doctor } from '@/lib/types';

// Dynamically import mappls-web-maps to avoid SSR issues
let mappls: any;
if (typeof window !== 'undefined') {
  import('mappls-web-maps').then(module => {
    mappls = module;
  });
}

type MapStatus = 'loading' | 'loaded' | 'error' | 'denied';

type Props = {
  doctors?: Doctor[] | null;
}

export function MapView({ doctors }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Use a ref to hold the map instance
  const [status, setStatus] = useState<MapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  const MAPPPLS_API_KEY = process.env.NEXT_PUBLIC_MAPPPLS_API_KEY;

  useEffect(() => {
    let isMounted = true;

    function initializeMap(lat: number, lon: number) {
      if (mapRef.current && !mapInstanceRef.current && mappls && isMounted) {
        const mapObject = new mappls.Map(mapRef.current, {
          center: [lat, lon],
          zoom: 12,
        });

        mapObject.on('load', () => {
          if (isMounted) {
            mapInstanceRef.current = mapObject;
            setStatus('loaded');
            // Initial user location marker
            new mappls.Marker({
              map: mapObject,
              position: { lat, lng: lon },
              icon: {
                html: `<div style="width: 20px; height: 20px; background-color: blue; border-radius: 50%; border: 2px solid white;"></div>`,
                width: 24,
                height: 24,
              },
            }).setPopupContent('Your Location');
          }
        });
      }
    }

    if (!MAPPPLS_API_KEY) {
      setStatus('error');
      setErrorMessage("Mappls API key is missing. Please add it to your .env file.");
      return;
    }

    const loadMap = () => {
      if (!mappls) {
        // Library is still loading, retry
        setTimeout(loadMap, 200);
        return;
      }
    
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const { latitude, longitude } = position.coords;
              initializeMap(latitude, longitude);
            }
          },
          (error) => {
            if (isMounted) {
              if (error.code === error.PERMISSION_DENIED) {
                setStatus('denied');
              } else {
                setStatus('error');
                setErrorMessage('Could not retrieve your location. Showing default.');
              }
              // Fallback to a default location if geolocation fails
              initializeMap(28.6139, 77.2090); // Default to Delhi
            }
          }
        );
      } else {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Geolocation is not supported by your browser. Showing default.');
          initializeMap(28.6139, 77.2090); // Default to Delhi
        }
      }
    };
    
    loadMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MAPPPLS_API_KEY]); 


  useEffect(() => {
    if (status !== 'loaded' || !mapInstanceRef.current || !mappls) return;

    // Clear existing doctor markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (doctors) {
      const bounds = new mappls.LngLatBounds();

      doctors.forEach((doctor) => {
        const marker = new mappls.Marker({
          map: mapInstanceRef.current,
          position: { lat: doctor.lat, lng: doctor.lng },
        }).setPopupContent(`<b>${doctor.name}</b><br/>${doctor.specialty}<br/>${doctor.address}`);
        markersRef.current.push(marker);
        bounds.extend([doctor.lng, doctor.lat]);
      });

      if (doctors.length > 0) {
        // Also include user's location in bounds if available
        const userLoc = mapInstanceRef.current.getCenter();
        bounds.extend([userLoc.lng, userLoc.lat]);
        mapInstanceRef.current.fitBounds(bounds, { padding: 80 });
      }
    }
  }, [doctors, status]);


  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader className="w-8 h-8 animate-spin mb-4" />
            <p>Loading Map & Getting Location...</p>
          </div>
        );
      case 'denied':
        return (
          <div className="flex flex-col items-center justify-center h-full text-amber-600 p-4">
            <AlertTriangle className="w-8 h-8 mb-4" />
            <p className="font-semibold">Location Access Denied</p>
            <p className="text-sm text-center">Enable location services to see nearby doctors. Displaying default location.</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
            <AlertTriangle className="w-8 h-8 mb-4" />
             <p className="font-semibold">Map Error</p>
            <p className="text-sm text-center">{errorMessage || 'An unknown error occurred.'}</p>
          </div>
        );
      case 'loaded':
        return null; // The map will be visible
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <CardTitle className="font-headline">Nearby Medical Centers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
            <div ref={mapRef} className="w-full h-full" />
            {status !== 'loaded' && (
                 <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                    {renderContent()}
                 </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

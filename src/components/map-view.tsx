'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'mappls-web-maps/dist/mappls-web-maps.css';

// Dynamically import mappls-web-maps to avoid SSR issues
let mappls: any;
if (typeof window !== 'undefined') {
  import('mappls-web-maps').then(module => {
    mappls = module;
  });
}

type MapStatus = 'loading' | 'loaded' | 'error' | 'denied';

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Use a ref to hold the map instance
  const [status, setStatus] = useState<MapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const MAPPPLS_API_KEY = "23ae46dccdaf9bda190c95fffbc1d923";

  useEffect(() => {
    let isMounted = true;

    function initializeMap(lat: number, lon: number) {
      if (mapRef.current && !mapInstanceRef.current && mappls && isMounted) {
        const mapObject = new mappls.Map(mapRef.current, {
          center: [lat, lon],
          zoom: 14,
        });

        mapObject.on('load', () => {
          if (isMounted) {
            mapInstanceRef.current = mapObject;
            setStatus('loaded');
            findNearbyHospitals(mapObject, lat, lon);
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

  const findNearbyHospitals = async (mapInstance: any, lat: number, lon: number) => {
    try {
        const response = await fetch(`https://apis.mappls.com/advancedmaps/v1/${MAPPPLS_API_KEY}/nearby_search?keywords=hospital&refLocation=${lat},${lon}`);
        const data = await response.json();

        if (data.suggestedLocations) {
            data.suggestedLocations.forEach((hospital: any) => {
              if (mappls) {
                new mappls.Marker({
                    map: mapInstance,
                    position: {
                        lat: hospital.latitude,
                        lng: hospital.longitude,
                    },
                }).setPopupContent(`<b>${hospital.placeName}</b><br/>${hospital.placeAddress}`);
              }
            });
        }
    } catch(err) {
        if (mapInstanceRef.current) { // Check if component is still mounted
          setStatus('error');
          setErrorMessage('Failed to fetch nearby hospitals.');
        }
    }
  };


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
            <p className="text-sm text-center">Enable location services to see nearby hospitals. Displaying default location.</p>
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

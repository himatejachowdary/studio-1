'use client';
import { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

type MapViewProps = {
    lat: number;
    lng: number;
    markers: { key: string; label: string; specialty: string; lat: number; lng: number }[];
};

export function MapView({ lat, lng, markers }: MapViewProps) {
    const position = useMemo(() => ({ lat, lng }), [lat, lng]);
    
    if (!API_KEY) {
        return <div className="h-96 w-full bg-muted flex items-center justify-center text-muted-foreground">Google Maps API Key is missing.</div>
    }

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden border">
            <APIProvider apiKey={API_KEY}>
                <Map
                    defaultCenter={position}
                    defaultZoom={12}
                    mapId="sympto-scan-map"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                >
                    {/* User's location marker */}
                    <AdvancedMarker position={position} title={"Your Location"}>
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary/80 border-2 border-primary-foreground"></span>
                        </span>
                    </AdvancedMarker>

                    {/* Doctor/Hospital markers */}
                    {markers.map(({ key, label, specialty, lat, lng }) => {
                        // A simple hash function to generate a semi-random position offset
                        const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const offsetLat = (hash % 100 - 50) * 0.0005; // ~55m
                        const offsetLng = (hash % 50 - 25) * 0.0005;

                        // Note: This is a pseudo-positioning for demonstration.
                        // In a real app, you would use geocoded coordinates for each doctor/hospital.
                        const markerPosition = { lat: lat + offsetLat, lng: lng + offsetLng };

                        return (
                            <AdvancedMarker key={key} position={markerPosition} title={label}>
                                <Pin 
                                    background={specialty === 'Hospital' ? '#C40C0C' : '#1d4ed8'}
                                    borderColor={specialty === 'Hospital' ? '#FF6969' : '#3b82f6'}
                                    glyphColor={'#FFF'}
                                >
                                </Pin>
                            </AdvancedMarker>
                        )
                    })}
                </Map>
            </APIProvider>
        </div>
    );
}

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';

export function MapPlaceholder() {
  const mapImage = placeholderImages.find(p => p.id === 'map-background');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <CardTitle className="font-headline">Nearby Medical Centers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
          {mapImage && (
            <Image
              src={mapImage.imageUrl}
              alt={mapImage.description}
              data-ai-hint={mapImage.imageHint}
              fill
              className="object-cover opacity-30"
            />
          )}
          <div className="z-10 text-center p-4">
            <h3 className="font-semibold text-muted-foreground">Map integration is loading...</h3>
            <p className="text-sm text-muted-foreground/80">(Google Maps API key required for full functionality)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import type { DestinationImage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface DestinationImagesDisplayProps {
  images: DestinationImage[] | null;
  destinationName: string | null;
  isLoading: boolean; // True if the parent component is generally loading (e.g. fetching all data)
}

export function DestinationImagesDisplay({ images, destinationName, isLoading }: DestinationImagesDisplayProps) {
  const showSkeletons = isLoading || !images || images.length === 0;

  if (!isLoading && (!images || images.length === 0 || images.every(img => img.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')))) {
    // Don't render the card if not loading and no actual images (or only placeholders from error) are available
    // or if there's no destination name to display in the title
    if(!destinationName) return null;
  }
  
  const displayImages = showSkeletons 
    ? Array(5).fill(null).map((_, index) => ({
        id: `skeleton-${index}`,
        src: `https://placehold.co/150x150.png?text=Loading...`, // Using a slightly more indicative placeholder
        alt: `Loading image ${index + 1}`,
        isSkeleton: true,
      }))
    : images;

  // Only render if there's a destination name (even for skeletons)
  if (!destinationName && !isLoading) return null;


  return (
    <Card className="w-full shadow-lg bg-card mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera size={24} />
          {showSkeletons && !destinationName ? 'Loading Images...' : `Images of ${destinationName || 'Destination'}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showSkeletons && images && images.every(img => img.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) && (
          <p className="text-sm text-muted-foreground text-center py-4">Could not load destination images.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {(displayImages || []).map((image) => (
            <div key={image.id} className="aspect-square w-full overflow-hidden rounded-md bg-muted">
              {image.isSkeleton ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={150}
                  height={150}
                  className="object-cover h-full w-full"
                  data-ai-hint={destinationName ? `${destinationName.split(',')[0].toLowerCase()} travel` : "travel photo"}
                  unoptimized={image.src.startsWith('data:image')} // Data URIs don't benefit from Next.js image optimization loader
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import type { DestinationImage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose, // Added for potential programmatic close, though default X is usually fine
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DestinationImagesDisplayProps {
  images: DestinationImage[] | null;
  destinationName: string | null;
  isLoading: boolean; // True if the parent component is generally loading (e.g. fetching all data)
}

export function DestinationImagesDisplay({ images, destinationName, isLoading }: DestinationImagesDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<DestinationImage | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleImageClick = (image: DestinationImage) => {
    // Don't open viewer for placeholder images from generation error
    if (image.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
        return;
    }
    setSelectedImage(image);
    setIsViewerOpen(true);
  };

  const showSkeletons = isLoading || !images || images.length === 0;

  if (!isLoading && (!images || images.length === 0 || images.every(img => img.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')))) {
    if(!destinationName) return null;
  }
  
  const displayImages = showSkeletons 
    ? Array(5).fill(null).map((_, index) => ({
        id: `skeleton-${index}`,
        src: `https://placehold.co/150x150.png`, 
        alt: `Loading image ${index + 1}`,
        isSkeleton: true,
      }))
    : images;

  if (!destinationName && !isLoading) return null;


  return (
    <>
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
              <Button
                key={image.id}
                variant="ghost"
                className="p-0 aspect-square w-full h-auto overflow-hidden rounded-md bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 block"
                onClick={() => !image.isSkeleton && handleImageClick(image)}
                disabled={image.isSkeleton || image.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')}
                aria-label={image.isSkeleton ? image.alt : `View enlarged image of ${image.alt}`}
              >
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
                    unoptimized={image.src.startsWith('data:image')} 
                  />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedImage && (
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[85vh] p-4 sm:p-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg sm:text-xl">
                {`Image of ${destinationName || 'destination'}`}
              </DialogTitle>
              {/* The X close button is part of DialogContent by default in ShadCN */}
            </DialogHeader>
            <div className="flex justify-center items-center overflow-hidden">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1200} 
                height={800} 
                className="object-contain max-w-full max-h-[70vh] rounded-md shadow-lg"
                unoptimized={selectedImage.src.startsWith('data:image')}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

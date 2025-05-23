
'use client';

import type { HistoricalTrip, PackingItem, DestinationImage } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, CalendarDays, Cloud, Camera, Trash2, MapPin, Briefcase, Thermometer } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface TripHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoricalTrip[];
  onClearHistory: () => void;
}

export function TripHistoryDialog({ isOpen, onClose, history, onClearHistory }: TripHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package size={28}/> Trip History
          </DialogTitle>
          <DialogDescription>
            Review your previously planned trips and packing lists.
          </DialogDescription>
        </DialogHeader>

        {history.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <Package size={64} className="text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No trip history yet.</p>
            <p className="text-sm text-muted-foreground">Plan a new trip to see it here!</p>
          </div>
        ) : (
          <ScrollArea className="flex-grow my-4 pr-2">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {history.map((trip) => (
                <AccordionItem value={trip.id} key={trip.id} className="border rounded-lg shadow-sm bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                        <div className='flex items-center gap-2'>
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg text-left">{trip.tripDetails.destination}</span>
                        </div>
                      <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                        {format(new Date(trip.timestamp), 'PPpp')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-1"><Briefcase size={16}/> Trip Type:</h4>
                        <p className="text-muted-foreground">{trip.tripDetails.tripType}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-1"><CalendarDays size={16}/> Duration:</h4>
                        <p className="text-muted-foreground">{trip.tripDetails.duration} days</p>
                      </div>
                      {trip.weather && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold mb-1 flex items-center gap-1"><Cloud size={16}/> Weather:</h4>
                          {trip.weather.temperature && (
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Thermometer size={14} className="text-primary" /> 
                              {trip.weather.temperature}
                            </p>
                          )}
                          <p className="text-muted-foreground">{trip.weather.description}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-1"><Package size={16}/> Packing List:</h4>
                      {trip.packingList.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground max-h-40 overflow-y-auto bg-secondary/30 p-3 rounded-md">
                          {trip.packingList.map((item) => (
                            <li key={item.id} className={item.packed ? 'line-through' : ''}>
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No items were in this packing list.</p>
                      )}
                    </div>

                    {trip.destinationImages && trip.destinationImages.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-1"><Camera size={16}/> Destination Images:</h4>
                        <div className="flex flex-wrap gap-2">
                          {trip.destinationImages.slice(0, 5).map((img) => ( // Show up to 5 thumbnails
                            img.src && !img.src.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=') && ( // Check for valid non-placeholder image
                              <div key={img.id} className="w-16 h-16 rounded-md overflow-hidden border">
                                <Image
                                  src={img.src}
                                  alt={img.alt}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                  unoptimized={img.src.startsWith('data:image')}
                                />
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}

        <DialogFooter className="mt-auto pt-4 border-t">
          {history.length > 0 && (
             <Button variant="destructive" onClick={() => { onClearHistory(); onClose();}} className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All History
              </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

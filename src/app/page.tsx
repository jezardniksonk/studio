
'use client';

import { useState, useEffect } from 'react';
import { TripForm } from '@/components/trip-form';
import { PackingList } from '@/components/packing-list';
import { WeatherDisplay } from '@/components/weather-display';
import { DestinationImagesDisplay } from '@/components/destination-images-display';
import { Logo } from '@/components/logo';
import type { TripDetails, PackingItem, WeatherInfo, DestinationImage } from '@/lib/types';
import { getPackingSuggestionsAction, getForgottenItemSuggestionsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { nanoid } from 'nanoid';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [destinationImages, setDestinationImages] = useState<DestinationImage[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingForgottenItems, setIsSuggestingForgottenItems] = useState(false);
  const { toast } = useToast();

  const handleTripSubmit = async (data: TripDetails) => {
    setIsLoading(true);
    setTripDetails(data);
    setPackingList([]); 
    setWeather(null); 
    setDestinationImages(null);

    try {
      const result = await getPackingSuggestionsAction(data);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setPackingList([]);
        setWeather(result.weather); 
        setDestinationImages(result.destinationImages || null); // Still set images if any were partially fetched or on error
      } else {
        setPackingList(result.packingList);
        setWeather(result.weather);
        setDestinationImages(result.destinationImages);
        toast({
          title: 'Suggestions Ready!',
          description: `We've prepared a packing list for your trip to ${data.destination}.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setPackingList([]);
      setWeather({ destination: data.destination, forecast: "Could not fetch weather data."}); 
      setDestinationImages(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToList = (itemName: string) => {
    const newItem: PackingItem = { id: nanoid(), name: itemName, packed: false, isSuggestion: false };
    setPackingList((prevList) => [...prevList, newItem]);
  };

  const removeItemFromList = (itemId: string) => {
    setPackingList((prevList) => prevList.filter((item) => item.id !== itemId));
  };

  const toggleItemPacked = (itemId: string) => {
    setPackingList((prevList) =>
      prevList.map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const handleSuggestForgottenItems = async () => {
    if (!tripDetails) {
      toast({
        title: 'Cannot get suggestions',
        description: 'Please plan a trip first to get forgotten item suggestions.',
        variant: 'destructive',
      });
      return;
    }
    if (packingList.length === 0) {
       toast({
        title: 'Empty List',
        description: 'Your packing list is currently empty. Add some items or get initial suggestions first.',
        variant: 'default',
      });
      return;
    }

    setIsSuggestingForgottenItems(true);
    const currentPackedNames = packingList.map(item => item.name);
    
    try {
      const { suggestions, error } = await getForgottenItemSuggestionsAction(tripDetails, currentPackedNames);
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else if (suggestions.length === 0) {
        toast({
          title: 'All Good!',
          description: "Looks like you haven't forgotten any common essentials for this trip type based on your current list!",
        });
      } else {
        const newItems = suggestions.filter(s => !packingList.some(ex => ex.name.toLowerCase() === s.name.toLowerCase()));
        if (newItems.length > 0) {
          setPackingList(prev => [...prev, ...newItems]);
          toast({
            title: 'New Suggestions Added!',
            description: `We found ${newItems.length} more item(s) you might need.`,
          });
        } else {
           toast({
            title: 'No New Items',
            description: "We double-checked, but it seems our previous suggestions already covered common forgotten items, or they are already on your list!",
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while suggesting forgotten items.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggestingForgottenItems(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background font-sans">
      <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <TripForm onSubmit={handleTripSubmit} isLoading={isLoading} />
          { (isLoading || weather) && <WeatherDisplay weather={weather} isLoading={isLoading && !weather} /> }
          { (isLoading || destinationImages) && tripDetails &&
            <DestinationImagesDisplay 
              images={destinationImages} 
              destinationName={tripDetails.destination}
              isLoading={isLoading && !destinationImages} 
            />
          }
        </div>

        <div className="md:col-span-2">
          <PackingList
            items={packingList}
            onAddItem={addItemToList}
            onRemoveItem={removeItemFromList}
            onToggleItem={toggleItemPacked}
            isLoading={isLoading}
            onSuggestForgottenItems={handleSuggestForgottenItems}
            isSuggestingForgottenItems={isSuggestingForgottenItems}
            hasTripDetails={!!tripDetails}
          />
        </div>
      </main>

      <footer className="w-full max-w-4xl mt-12 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PackSmart. Travel smarter, not harder.
        </p>
      </footer>
    </div>
  );
}

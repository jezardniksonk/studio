
'use client';

import { useState, useEffect } from 'react';
import { TripForm } from '@/components/trip-form';
import { PackingList } from '@/components/packing-list';
import { WeatherDisplay } from '@/components/weather-display';
import { Logo } from '@/components/logo';
import type { TripDetails, PackingItem, WeatherInfo } from '@/lib/types';
import { getPackingSuggestionsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { nanoid } from 'nanoid';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Effect to ensure nanoid is only used client-side after mount if needed for initial state.
  // Here, nanoid is used in server actions or client-side handlers, so direct usage is fine.

  const handleTripSubmit = async (data: TripDetails) => {
    setIsLoading(true);
    setTripDetails(data);
    setPackingList([]); // Clear previous list
    setWeather(null); // Clear previous weather

    try {
      const result = await getPackingSuggestionsAction(data);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setPackingList([]);
        setWeather(result.weather); // Display weather even if AI suggestions fail (e.g. "Could not fetch weather")
      } else {
        setPackingList(result.packingList);
        setWeather(result.weather);
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
      setWeather({ destination: data.destination, forecast: "Could not fetch weather data."}); // Set default error weather
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToList = (itemName: string) => {
    // Ensure nanoid is available (it should be, as this is a client component)
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
        </div>

        <div className="md:col-span-2">
          <PackingList
            items={packingList}
            onAddItem={addItemToList}
            onRemoveItem={removeItemFromList}
            onToggleItem={toggleItemPacked}
            isLoading={isLoading}
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

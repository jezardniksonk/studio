
'use server';

import type { TripDetails, AIPackingSuggestionsInput, PackingItem, WeatherInfo } from '@/lib/types';
import { packingSuggestions } from '@/ai/flows/packing-suggestions'; 
import { didYouForgetReminder, type DidYouForgetReminderInput } from '@/ai/flows/did-you-forget-reminder';
import {nanoid} from 'nanoid';


// Mock weather data - replace with actual API call in a real app
const MOCK_WEATHER_DATA: Record<string, string> = {
  'paris': 'Partly cloudy with a high of 22°C. Chance of light showers in the evening.',
  'tokyo': 'Sunny and warm, around 28°C. Perfect for sightseeing!',
  'new york': 'Cooler, around 18°C with a chance of rain. Bring a jacket.',
  'london': 'Classic London weather: Overcast with intermittent drizzle, 15°C.',
  'bali': 'Hot and humid, 30°C with afternoon thunderstorms likely.',
  'rome': 'Sunny and pleasant, 25°C. Ideal for exploring ancient ruins.',
  'barcelona': 'Warm and sunny, 27°C. Don\'t forget your sunglasses!',
  'berlin': 'Mild, around 20°C with a mix of sun and clouds.',
  'sydney': 'Sunny skies and 24°C. Great for beach activities.',
  'dubai': 'Very hot, reaching 38°C. Stay hydrated and seek shade.',
  'reykjavik': 'Chilly and windy, around 8°C. Pack warm layers!',
  'cancun': 'Hot and sunny, 29°C. Perfect beach weather!',
  'amsterdam': 'Cloudy with a chance of showers, 17°C. An umbrella might be useful.',
  'mount everest': 'Extremely cold and snowy, -20°C. Specialized gear required.',
  'sahara desert': 'Scorching hot during the day (40°C+), cold at night. Pack accordingly.',
};

async function fetchWeather(destination: string): Promise<string> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const cityKey = destination.toLowerCase().split(',')[0].trim(); // Use first part of destination as key
  return MOCK_WEATHER_DATA[cityKey] || `Pleasant weather expected in ${destination}. Pack for moderate temperatures.`;
}

export async function getPackingSuggestionsAction(
  tripDetails: TripDetails
): Promise<{ packingList: PackingItem[]; weather: WeatherInfo; error?: string }> {
  try {
    const destinationWeather = await fetchWeather(tripDetails.destination);

    const aiInput: AIPackingSuggestionsInput = {
      tripType: tripDetails.tripType,
      duration: tripDetails.duration,
      destinationWeather: destinationWeather,
    };

    const result = await packingSuggestions(aiInput);
    
    const packingList: PackingItem[] = result.packingList.map(name => ({
      id: nanoid(),
      name,
      packed: false,
      isSuggestion: true,
    }));
    
    const weather: WeatherInfo = {
      destination: tripDetails.destination,
      forecast: destinationWeather,
    };

    return { packingList, weather };

  } catch (error) {
    console.error('Error getting packing suggestions:', error);
    let errorMessage = 'Failed to get packing suggestions. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Ensure a default weather object is returned on error for consistent UI handling
    const weatherOnError: WeatherInfo = {
      destination: tripDetails.destination,
      forecast: 'Could not fetch weather data.',
    };
    return { 
      packingList: [], 
      weather: weatherOnError, 
      error: errorMessage 
    };
  }
}

export async function getForgottenItemSuggestionsAction(
  tripDetails: TripDetails,
  packedItemNames: string[]
): Promise<{ suggestions: PackingItem[]; error?: string }> {
  try {
    const aiInput: DidYouForgetReminderInput = {
      tripType: tripDetails.tripType,
      duration: tripDetails.duration,
      packedItems: packedItemNames,
    };

    const result = await didYouForgetReminder(aiInput);

    const suggestions: PackingItem[] = result.suggestedItems.map(name => ({
      id: nanoid(),
      name,
      packed: false,
      isSuggestion: true, 
    }));

    return { suggestions };

  } catch (error) {
    console.error('Error getting forgotten item suggestions:', error);
    let errorMessage = 'Failed to get forgotten item suggestions. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { suggestions: [], error: errorMessage };
  }
}

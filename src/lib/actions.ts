
'use server';

import type { TripDetails, AIPackingSuggestionsInput, PackingItem, WeatherInfo, DestinationImage } from '@/lib/types';
import { packingSuggestions } from '@/ai/flows/packing-suggestions'; 
import { didYouForgetReminder, type DidYouForgetReminderInput } from '@/ai/flows/did-you-forget-reminder';
import { generateDestinationImages } from '@/ai/flows/generate-destination-images';
import {nanoid} from 'nanoid';


const MOCK_WEATHER_DATA: Record<string, { description: string; temperature: string }> = {
  'paris': { description: 'Partly cloudy. Chance of light showers in the evening.', temperature: '22°C' },
  'tokyo': { description: 'Sunny and warm. Perfect for sightseeing!', temperature: '28°C' },
  'new york': { description: 'Cooler with a chance of rain. Bring a jacket.', temperature: '18°C' },
  'london': { description: 'Classic London weather: Overcast with intermittent drizzle.', temperature: '15°C' },
  'bali': { description: 'Hot and humid with afternoon thunderstorms likely.', temperature: '30°C' },
  'rome': { description: 'Sunny and pleasant. Ideal for exploring ancient ruins.', temperature: '25°C' },
  'barcelona': { description: 'Warm and sunny. Don\'t forget your sunglasses!', temperature: '27°C' },
  'berlin': { description: 'Mild with a mix of sun and clouds.', temperature: '20°C' },
  'sydney': { description: 'Sunny skies. Great for beach activities.', temperature: '24°C' },
  'dubai': { description: 'Very hot. Stay hydrated and seek shade.', temperature: '38°C' },
  'reykjavik': { description: 'Chilly and windy. Pack warm layers!', temperature: '8°C' },
  'cancun': { description: 'Hot and sunny. Perfect beach weather!', temperature: '29°C' },
  'amsterdam': { description: 'Cloudy with a chance of showers. An umbrella might be useful.', temperature: '17°C' },
  'mount everest': { description: 'Extremely cold and snowy. Specialized gear required.', temperature: '-20°C' },
  'sahara desert': { description: 'Scorching hot during the day, cold at night. Pack accordingly.', temperature: '40°C+' },
};

async function fetchWeather(destination: string): Promise<{ description: string; temperature: string | null }> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const cityKey = destination.toLowerCase().split(',')[0].trim(); // Use first part of destination as key
  const weatherData = MOCK_WEATHER_DATA[cityKey];
  if (weatherData) {
    return { description: weatherData.description, temperature: weatherData.temperature };
  }
  return { description: `Pleasant weather expected in ${destination}. Pack for moderate temperatures.`, temperature: null };
}

export async function getPackingSuggestionsAction(
  tripDetails: TripDetails
): Promise<{ 
  packingList: PackingItem[]; 
  weather: WeatherInfo; 
  destinationImages: DestinationImage[]; 
  error?: string 
}> {
  try {
    const weatherDetails = await fetchWeather(tripDetails.destination);

    const weatherForState: WeatherInfo = {
      destination: tripDetails.destination,
      description: weatherDetails.description,
      temperature: weatherDetails.temperature,
    };

    const aiWeatherDescription = weatherDetails.temperature
      ? `${weatherDetails.description} The temperature is around ${weatherDetails.temperature}.`
      : weatherDetails.description;

    const aiInput: AIPackingSuggestionsInput = {
      tripType: tripDetails.tripType,
      duration: tripDetails.duration,
      destinationWeather: aiWeatherDescription,
    };

    // Fetch packing suggestions and images in parallel
    const [packingResult, imageResult] = await Promise.all([
      packingSuggestions(aiInput),
      generateDestinationImages({ destinationName: tripDetails.destination })
    ]);
    
    const packingList: PackingItem[] = packingResult.packingList.map(name => ({
      id: nanoid(),
      name,
      packed: false,
      isSuggestion: true,
    }));
    
    const destinationImages: DestinationImage[] = imageResult.imageDataUris.map((uri, index) => ({
      id: nanoid(),
      src: uri,
      alt: `Destination image ${index + 1} for ${tripDetails.destination}`,
    }));

    return { packingList, weather: weatherForState, destinationImages };

  } catch (error) {
    console.error('Error getting packing suggestions or images:', error);
    let errorMessage = 'Failed to get packing suggestions or images. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const weatherOnError: WeatherInfo = {
      destination: tripDetails.destination,
      description: 'Could not fetch weather data.',
      temperature: null,
    };
    return { 
      packingList: [], 
      weather: weatherOnError, 
      destinationImages: Array(5).fill(null).map((_, index) => ({ // Return placeholder structure on error
        id: nanoid(),
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        alt: `Placeholder image ${index + 1}`
      })),
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


'use server';

import type { TripDetails, AIPackingSuggestionsInput, PackingItem, WeatherInfo, DestinationImage, DailyForecast } from '@/lib/types';
import { packingSuggestions } from '@/ai/flows/packing-suggestions'; 
import { didYouForgetReminder, type DidYouForgetReminderInput } from '@/ai/flows/did-you-forget-reminder';
import { generateDestinationImages } from '@/ai/flows/generate-destination-images';
import {nanoid} from 'nanoid';

const MOCK_WEATHER_DATA: Record<string, DailyForecast[]> = {
  'paris': [
    { label: 'Yesterday', description: 'Cloudy with patches of rain.', temperature: '18°C' },
    { label: 'Today', description: 'Partly cloudy. Chance of light showers in the evening.', temperature: '22°C' },
    { label: 'Tomorrow', description: 'Sunny spells, pleasant.', temperature: '23°C' }
  ],
  'tokyo': [
    { label: 'Yesterday', description: 'Mostly sunny and warm.', temperature: '27°C' },
    { label: 'Today', description: 'Sunny and warm. Perfect for sightseeing!', temperature: '28°C' },
    { label: 'Tomorrow', description: 'Clear skies, slightly warmer.', temperature: '29°C' }
  ],
  'new york': [
    { label: 'Yesterday', description: 'Overcast and cool.', temperature: '17°C' },
    { label: 'Today', description: 'Cooler with a chance of rain. Bring a jacket.', temperature: '18°C' },
    { label: 'Tomorrow', description: 'Showers likely, clearing later.', temperature: '19°C' }
  ],
  'london': [
    { label: 'Yesterday', description: 'Grey and drizzly.', temperature: '14°C' },
    { label: 'Today', description: 'Classic London weather: Overcast with intermittent drizzle.', temperature: '15°C' },
    { label: 'Tomorrow', description: 'Similar, with a chance of heavier rain.', temperature: '16°C' }
  ],
  'bali': [
    { label: 'Yesterday', description: 'Hot and humid, scattered thunderstorms.', temperature: '29°C' },
    { label: 'Today', description: 'Hot and humid with afternoon thunderstorms likely.', temperature: '30°C' },
    { label: 'Tomorrow', description: 'Continued heat and humidity, possible showers.', temperature: '31°C' }
  ],
  // Add more destinations with 3-day forecasts
  'rome': [
    { label: 'Yesterday', description: 'Sunny and beautiful.', temperature: '24°C' },
    { label: 'Today', description: 'Sunny and pleasant. Ideal for exploring ancient ruins.', temperature: '25°C' },
    { label: 'Tomorrow', description: 'Clear skies, staying warm.', temperature: '26°C' }
  ],
  'barcelona': [
    { label: 'Yesterday', description: 'Warm with plenty of sun.', temperature: '26°C' },
    { label: 'Today', description: 'Warm and sunny. Don\'t forget your sunglasses!', temperature: '27°C' },
    { label: 'Tomorrow', description: 'Hot and sunny.', temperature: '28°C' }
  ],
  'berlin': [
    { label: 'Yesterday', description: 'Mild, partly cloudy.', temperature: '19°C' },
    { label: 'Today', description: 'Mild with a mix of sun and clouds.', temperature: '20°C' },
    { label: 'Tomorrow', description: 'Slightly warmer, more sun.', temperature: '21°C' }
  ],
  'sydney': [
    { label: 'Yesterday', description: 'Sunny and pleasant.', temperature: '23°C' },
    { label: 'Today', description: 'Sunny skies. Great for beach activities.', temperature: '24°C' },
    { label: 'Tomorrow', description: 'Clear and warm.', temperature: '25°C' }
  ],
  'dubai': [
    { label: 'Yesterday', description: 'Very hot and sunny.', temperature: '37°C' },
    { label: 'Today', description: 'Very hot. Stay hydrated and seek shade.', temperature: '38°C' },
    { label: 'Tomorrow', description: 'Extreme heat continues.', temperature: '39°C' }
  ],
  'reykjavik': [
    { label: 'Yesterday', description: 'Cold and windy.', temperature: '7°C' },
    { label: 'Today', description: 'Chilly and windy. Pack warm layers!', temperature: '8°C' },
    { label: 'Tomorrow', description: 'Cloudy and cold.', temperature: '7°C' }
  ],
  'cancun': [
    { label: 'Yesterday', description: 'Hot with sunshine.', temperature: '28°C' },
    { label: 'Today', description: 'Hot and sunny. Perfect beach weather!', temperature: '29°C' },
    { label: 'Tomorrow', description: 'Continued sunshine and heat.', temperature: '30°C' }
  ],
  'amsterdam': [
    { label: 'Yesterday', description: 'Cloudy, chance of light rain.', temperature: '16°C' },
    { label: 'Today', description: 'Cloudy with a chance of showers. An umbrella might be useful.', temperature: '17°C' },
    { label: 'Tomorrow', description: 'Overcast, showers possible.', temperature: '17°C' }
  ],
  'mount everest': [
    { label: 'Yesterday', description: 'Extremely cold, heavy snow.', temperature: '-22°C' },
    { label: 'Today', description: 'Extremely cold and snowy. Specialized gear required.', temperature: '-20°C' },
    { label: 'Tomorrow', description: 'Severe cold, blizzard conditions.', temperature: '-25°C' }
  ],
  'sahara desert': [
    { label: 'Yesterday', description: 'Scorching hot day, cool night.', temperature: '42°C' },
    { label: 'Today', description: 'Scorching hot during the day, cold at night. Pack accordingly.', temperature: '40°C+' },
    { label: 'Tomorrow', description: 'Extreme heat, clear skies.', temperature: '43°C' }
  ],
};

async function fetchWeather(destination: string): Promise<WeatherInfo> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  const cityKey = destination.toLowerCase().split(',')[0].trim();
  const forecastData = MOCK_WEATHER_DATA[cityKey];

  if (forecastData) {
    return { destination, forecasts: forecastData };
  }

  // Default fallback if destination not in mock data
  const defaultForecasts: DailyForecast[] = [
    { label: 'Yesterday', description: `Weather data unavailable for ${destination}.`, temperature: 'N/A' },
    { label: 'Today', description: `Pleasant weather expected. Pack for moderate temperatures.`, temperature: '20°C' },
    { label: 'Tomorrow', description: `Weather data unavailable for ${destination}.`, temperature: 'N/A' },
  ];
  return { destination, forecasts: defaultForecasts };
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

    // Use Today's forecast for AI input
    const todayWeather = weatherDetails.forecasts.find(f => f.label === 'Today') || weatherDetails.forecasts[0];
    const aiWeatherDescription = todayWeather.temperature !== 'N/A'
      ? `${todayWeather.description} The temperature is around ${todayWeather.temperature}.`
      : todayWeather.description;

    const aiInput: AIPackingSuggestionsInput = {
      tripType: tripDetails.tripType,
      duration: tripDetails.duration,
      destinationWeather: aiWeatherDescription,
    };

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

    return { packingList, weather: weatherDetails, destinationImages };

  } catch (error) {
    console.error('Error getting packing suggestions or images:', error);
    let errorMessage = 'Failed to get packing suggestions or images. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    const placeholderForecasts: DailyForecast[] = [
      { label: 'Yesterday', description: 'Could not fetch weather data.', temperature: 'N/A' },
      { label: 'Today', description: 'Could not fetch weather data.', temperature: 'N/A' },
      { label: 'Tomorrow', description: 'Could not fetch weather data.', temperature: 'N/A' },
    ];
    const weatherOnError: WeatherInfo = {
      destination: tripDetails.destination,
      forecasts: placeholderForecasts,
    };
    return { 
      packingList: [], 
      weather: weatherOnError, 
      destinationImages: Array(5).fill(null).map((_, index) => ({
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

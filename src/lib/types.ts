
export interface TripDetails {
  destination: string;
  tripType: string;
  duration: number; // in days
}

export interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
  isSuggestion?: boolean; // True if item was suggested by AI
}

export interface DailyForecast {
  label: string; // "Yesterday", "Today", "Tomorrow"
  description: string;
  temperature: string; // e.g., "22°C"
}

export interface WeatherInfo {
  destination: string;
  forecasts: DailyForecast[]; // Array of 3: [Yesterday, Today, Tomorrow]
}

// Matches the input schema for the AI flow
export interface AIPackingSuggestionsInput {
  tripType: string;
  duration: number;
  destinationWeather: string;
}

export interface DestinationImage {
  id: string;
  src: string; // data URI
  alt: string;
  isSkeleton?: boolean; // Added for UI display
}

export interface HistoricalTrip {
  id: string;
  timestamp: number; // Unix timestamp
  tripDetails: TripDetails;
  packingList: PackingItem[];
  weather: WeatherInfo | null; // Will store the full WeatherInfo, but dialog might only display "Today"
  destinationImages: DestinationImage[] | null;
}


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

export interface WeatherInfo {
  destination: string;
  forecast: string; // e.g., "Sunny with a high of 25°C"
  icon?: string; // Optional: for weather icon representation
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
  weather: WeatherInfo | null;
  destinationImages: DestinationImage[] | null;
}

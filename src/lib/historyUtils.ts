
'use client';

import type { HistoricalTrip, TripDetails, PackingItem, WeatherInfo, DestinationImage } from '@/lib/types';
import { nanoid } from 'nanoid';

const PACKSMART_TRIP_HISTORY_KEY = 'packsmartTripHistory';
const MAX_HISTORY_ITEMS = 10;

export function getTripHistory(): HistoricalTrip[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedHistory = localStorage.getItem(PACKSMART_TRIP_HISTORY_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error("Error retrieving trip history from localStorage:", error);
    return [];
  }
}

export function addTripToHistory(
  tripDetails: TripDetails,
  packingList: PackingItem[],
  weather: WeatherInfo | null,
  destinationImages: DestinationImage[] | null
): HistoricalTrip[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const currentHistory = getTripHistory();
  const newHistoricalTrip: HistoricalTrip = {
    id: nanoid(),
    timestamp: Date.now(),
    tripDetails,
    packingList,
    weather,
    destinationImages,
  };

  const updatedHistory = [newHistoricalTrip, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  
  try {
    localStorage.setItem(PACKSMART_TRIP_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving trip history to localStorage:", error);
  }
  return updatedHistory;
}

export function clearTripHistory(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(PACKSMART_TRIP_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing trip history from localStorage:", error);
  }
}

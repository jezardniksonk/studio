
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
  destinationImages: DestinationImage[] | null // This parameter is kept for signature consistency but won't be stored
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
    destinationImages: null, // Do not store large images in localStorage to prevent quota errors
  };

  const updatedHistory = [newHistoricalTrip, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  
  try {
    localStorage.setItem(PACKSMART_TRIP_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    // It's still possible to hit quota if other data is extremely large,
    // or if this function is called very rapidly before UI updates.
    console.error("Error saving trip history to localStorage:", error); 
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Potentially try to remove the oldest item and retry, or just log and accept failure.
      // For now, we'll just log it, as image removal should significantly reduce the chance.
      console.warn("LocalStorage quota exceeded even after removing images from history item. Consider reducing MAX_HISTORY_ITEMS or data stored per trip.");
    }
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


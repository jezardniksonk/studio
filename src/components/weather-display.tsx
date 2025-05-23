
'use client';

import type { WeatherInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudFog, CloudDrizzle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherDisplayProps {
  weather: WeatherInfo | null;
  isLoading: boolean;
}

const getWeatherIcon = (description: string | undefined) => {
  if (!description) return <Sun className="h-6 w-6 text-yellow-500" />;
  const lowerDescription = description.toLowerCase();
  if (lowerDescription.includes('thunderstorm') || lowerDescription.includes('storm')) return <Zap className="h-6 w-6 text-yellow-400" />;
  if (lowerDescription.includes('drizzle')) return <CloudDrizzle className="h-6 w-6 text-blue-300" />;
  if (lowerDescription.includes('rain') || lowerDescription.includes('showers')) return <CloudRain className="h-6 w-6 text-blue-400" />;
  if (lowerDescription.includes('snow')) return <CloudSnow className="h-6 w-6 text-sky-300" />;
  if (lowerDescription.includes('fog') || lowerDescription.includes('mist')) return <CloudFog className="h-6 w-6 text-gray-500" />;
  if (lowerDescription.includes('cloud') || lowerDescription.includes('overcast')) return <Cloud className="h-6 w-6 text-gray-400" />;
  if (lowerDescription.includes('sun') || lowerDescription.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
  return <Sun className="h-6 w-6 text-yellow-500" />; // Default icon
};

export function WeatherDisplay({ weather, isLoading }: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-24 mb-2" /> 
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null; // Don't render if no weather data and not loading
  }

  return (
    <Card className="w-full shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {getWeatherIcon(weather.description)}
          Weather for {weather.destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weather.temperature && (
          <p className="text-2xl font-bold text-primary">{weather.temperature}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">{weather.description}</p>
      </CardContent>
    </Card>
  );
}

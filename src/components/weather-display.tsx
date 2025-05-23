'use client';

import type { WeatherInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudFog, CloudDrizzle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherDisplayProps {
  weather: WeatherInfo | null;
  isLoading: boolean;
}

const getWeatherIcon = (forecast: string | undefined) => {
  if (!forecast) return <Sun className="h-6 w-6 text-yellow-500" />;
  const lowerForecast = forecast.toLowerCase();
  if (lowerForecast.includes('thunderstorm') || lowerForecast.includes('storm')) return <Zap className="h-6 w-6 text-yellow-400" />;
  if (lowerForecast.includes('drizzle')) return <CloudDrizzle className="h-6 w-6 text-blue-300" />;
  if (lowerForecast.includes('rain') || lowerForecast.includes('showers')) return <CloudRain className="h-6 w-6 text-blue-400" />;
  if (lowerForecast.includes('snow')) return <CloudSnow className="h-6 w-6 text-sky-300" />;
  if (lowerForecast.includes('fog') || lowerForecast.includes('mist')) return <CloudFog className="h-6 w-6 text-gray-500" />;
  if (lowerForecast.includes('cloud') || lowerForecast.includes('overcast')) return <Cloud className="h-6 w-6 text-gray-400" />;
  if (lowerForecast.includes('sun') || lowerForecast.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
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
          <Skeleton className="h-5 w-48" />
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
          {getWeatherIcon(weather.forecast)}
          Weather for {weather.destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{weather.forecast}</p>
      </CardContent>
    </Card>
  );
}

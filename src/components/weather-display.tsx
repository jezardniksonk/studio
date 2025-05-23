
'use client';

import type { WeatherInfo, DailyForecast } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudFog, CloudDrizzle, CalendarDays, Thermometer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

interface WeatherDisplayProps {
  weather: WeatherInfo | null;
  isLoading: boolean;
}

const getWeatherIcon = (description: string | undefined) => {
  if (!description) return <Sun className="h-5 w-5 text-yellow-500" />;
  const lowerDescription = description.toLowerCase();
  if (lowerDescription.includes('thunderstorm') || lowerDescription.includes('storm')) return <Zap className="h-5 w-5 text-yellow-400" />;
  if (lowerDescription.includes('drizzle')) return <CloudDrizzle className="h-5 w-5 text-blue-300" />;
  if (lowerDescription.includes('rain') || lowerDescription.includes('showers')) return <CloudRain className="h-5 w-5 text-blue-400" />;
  if (lowerDescription.includes('snow')) return <CloudSnow className="h-5 w-5 text-sky-300" />;
  if (lowerDescription.includes('fog') || lowerDescription.includes('mist')) return <CloudFog className="h-5 w-5 text-gray-500" />;
  if (lowerDescription.includes('cloud') || lowerDescription.includes('overcast')) return <Cloud className="h-5 w-5 text-gray-400" />;
  if (lowerDescription.includes('sun') || lowerDescription.includes('clear')) return <Sun className="h-5 w-5 text-yellow-500" />;
  return <Sun className="h-5 w-5 text-yellow-500" />; // Default icon
};

export function WeatherDisplay({ weather, isLoading }: WeatherDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" /> {/* Adjusted width */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" /> {/* Temp for today */}
            <Skeleton className="h-4 w-48" /> {/* Desc for today */}
          </div>
          {isExpanded && ( // Skeletons for expanded view if it were to be expanded while loading
            <div className="mt-3 pt-3 border-t">
              {[1, 2].map(i => (
                <div key={i} className="mt-2 space-y-1">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-5 w-24" /> {/* Temp */}
                  <Skeleton className="h-4 w-40" /> {/* Desc */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!weather || !weather.forecasts || weather.forecasts.length === 0) {
    return null;
  }

  const todayForecast = weather.forecasts.find(f => f.label === 'Today') || weather.forecasts[0];

  return (
    <Card className="w-full shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            {getWeatherIcon(todayForecast?.description)}
            Weather for {weather.destination}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        className="cursor-pointer hover:bg-muted/50 rounded-b-lg"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded)}}
      >
        {/* Today's Forecast Summary */}
        <div className="mb-2">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-primary">{todayForecast?.label}</p>
                {todayForecast?.temperature && todayForecast.temperature !== 'N/A' && (
                    <p className="text-2xl font-bold text-primary flex items-center">
                        <Thermometer size={20} className="mr-1"/> {todayForecast.temperature}
                    </p>
                )}
            </div>
          <p className="text-sm text-muted-foreground mt-1">{todayForecast?.description}</p>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {weather.forecasts.map((forecast) => (
              <div key={forecast.label} className={`p-2 rounded-md ${forecast.label === 'Today' ? 'bg-secondary/50' : ''}`}>
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-md flex items-center gap-1">
                        {getWeatherIcon(forecast.description)}
                        {forecast.label}
                    </p>
                    {forecast.temperature && forecast.temperature !== 'N/A' && (
                         <p className="text-lg font-semibold text-foreground flex items-center">
                            <Thermometer size={16} className="mr-1"/> {forecast.temperature}
                        </p>
                    )}
                </div>
                <p className="text-xs text-muted-foreground ml-6">{forecast.description}</p>
              </div>
            ))}
          </div>
        )}
        <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-xs">
          {isExpanded ? 'Show less' : 'Show 3-day forecast'}
        </Button>
      </CardContent>
    </Card>
  );
}

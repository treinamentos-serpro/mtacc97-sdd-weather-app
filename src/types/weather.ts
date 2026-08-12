export interface LocationSuggestion {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number | null;
  precipitation: number | null;
  uvIndex: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  condition: string;
  icon: string;
  updatedAt: string;
}

export interface ForecastDay {
  date: string;
  minTemperature: number;
  maxTemperature: number;
  condition: string;
  rainProbability: number | null;
}

export interface WeatherData {
  location: LocationSuggestion;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph';

export interface Units {
  temperature: TemperatureUnit;
  wind: WindUnit;
}

export type AppStatus = 'idle' | 'searching' | 'loaded' | 'error';

export interface AppState {
  searchQuery: string;
  suggestions: LocationSuggestion[];
  selectedLocation: LocationSuggestion | null;
  weatherData: WeatherData | null;
  units: Units;
  loading: boolean;
  error: string | null;
  status: AppStatus;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchLocations } from '../services/weatherService';
import type { AppStatus, LocationSuggestion, Units, WeatherData } from '../types/weather';

const SEARCH_DEBOUNCE_MS = 300;
const UNITS_STORAGE_KEY = 'weather-app:units';
const LOCATION_STORAGE_KEY = 'weather-app:last-location';

const DEFAULT_UNITS: Units = { temperature: 'celsius', wind: 'kmh' };

function loadStoredUnits(): Units {
  try {
    const raw = localStorage.getItem(UNITS_STORAGE_KEY);
    return raw ? { ...DEFAULT_UNITS, ...JSON.parse(raw) } : DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
}

function loadStoredLocation(): LocationSuggestion | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocationSuggestion) : null;
  } catch {
    return null;
  }
}

export interface UseWeatherResult {
  searchQuery: string;
  suggestions: LocationSuggestion[];
  selectedLocation: LocationSuggestion | null;
  weatherData: WeatherData | null;
  units: Units;
  loading: boolean;
  error: string | null;
  status: AppStatus;
  searchLocation: (query: string) => void;
  selectLocation: (location: LocationSuggestion) => Promise<void>;
  refreshWeather: () => Promise<void>;
  toggleUnits: (kind: 'temperature' | 'wind') => void;
  useGeolocation: () => void;
}

export function useWeather(): UseWeatherResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(
    () => loadStoredLocation(),
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [units, setUnits] = useState<Units>(() => loadStoredUnits());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchWeatherFor = useCallback(async (location: LocationSuggestion) => {
    setLoading(true);
    setError(null);
    try {
      const { current, forecast } = await getWeather(location.latitude, location.longitude);
      setWeatherData({ location, current, forecast });
      setStatus('loaded');
    } catch {
      setError('Não foi possível carregar o clima agora. Tente novamente em instantes.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchLocation = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setStatus('idle');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setStatus('searching');
      setError(null);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setStatus(results.length === 0 ? 'idle' : 'searching');
      } catch {
        setError('Não foi possível buscar localidades agora. Tente novamente em instantes.');
        setStatus('error');
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const selectLocation = useCallback(
    async (location: LocationSuggestion) => {
      setSelectedLocation(location);
      setSuggestions([]);
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      await fetchWeatherFor(location);
    },
    [fetchWeatherFor],
  );

  const refreshWeather = useCallback(async () => {
    if (selectedLocation) {
      await fetchWeatherFor(selectedLocation);
    }
  }, [selectedLocation, fetchWeatherFor]);

  const toggleUnits = useCallback((kind: 'temperature' | 'wind') => {
    setUnits((prev) => {
      const next: Units =
        kind === 'temperature'
          ? { ...prev, temperature: prev.temperature === 'celsius' ? 'fahrenheit' : 'celsius' }
          : { ...prev, wind: prev.wind === 'kmh' ? 'mph' : 'kmh' };
      localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const useGeolocationAction = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationSuggestion = {
          id: 'geolocation',
          name: 'Minha localização',
          region: '',
          country: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        void selectLocation(location);
      },
      () => {
        setError(null);
      },
    );
  }, [selectLocation]);

  useEffect(() => {
    if (selectedLocation && !weatherData) {
      void fetchWeatherFor(selectedLocation);
    }
  }, [selectedLocation, weatherData, fetchWeatherFor]);

  return {
    searchQuery,
    suggestions,
    selectedLocation,
    weatherData,
    units,
    loading,
    error,
    status,
    searchLocation,
    selectLocation,
    refreshWeather,
    toggleUnits,
    useGeolocation: useGeolocationAction,
  };
}

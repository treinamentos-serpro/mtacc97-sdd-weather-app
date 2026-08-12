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
  geoLoading: boolean;
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
  const [geoLoading, setGeoLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const weatherRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);

  const fetchWeatherFor = useCallback(async (location: LocationSuggestion) => {
    const requestId = ++weatherRequestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const { current, forecast } = await getWeather(location.latitude, location.longitude);
      if (requestId !== weatherRequestIdRef.current) return; // resposta obsoleta: ignorar
      setWeatherData({ location, current, forecast });
      setStatus('loaded');
    } catch {
      if (requestId !== weatherRequestIdRef.current) return;
      setError(
        navigator.onLine === false
          ? 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
          : 'Não foi possível carregar o clima agora. Tente novamente em instantes.',
      );
      setStatus('error');
    } finally {
      if (requestId === weatherRequestIdRef.current) setLoading(false);
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
      const requestId = ++searchRequestIdRef.current;
      setStatus('searching');
      setError(null);
      try {
        const results = await searchLocations(query);
        if (requestId !== searchRequestIdRef.current) return; // resposta obsoleta: ignorar
        setSuggestions(results);
        setStatus(results.length === 0 ? 'idle' : 'searching');
      } catch {
        if (requestId !== searchRequestIdRef.current) return;
        setError(
          navigator.onLine === false
            ? 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
            : 'Não foi possível buscar localidades agora. Tente novamente em instantes.',
        );
        setStatus('error');
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const selectLocation = useCallback(
    async (location: LocationSuggestion) => {
      setSelectedLocation(location);
      setSuggestions([]);
      setSearchQuery('');
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
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador. Use a busca manual.');
      setStatus('error');
      return;
    }
    setGeoLoading(true);
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
        void selectLocation(location).finally(() => setGeoLoading(false));
      },
      () => {
        setGeoLoading(false);
        setError('Não foi possível obter sua localização. Você pode continuar buscando manualmente.');
        setStatus('error');
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
    geoLoading,
  };
}

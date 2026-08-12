import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { CurrentWeather, ForecastDay, LocationSuggestion, Units } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const SUGGESTIONS_LIMIT = 5;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

export class WeatherServiceError extends Error {}

interface RawGeocodingResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

interface RawForecastResponse {
  current?: {
    time: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    uv_index?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
    weather_code?: number[];
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries transient failures with a short exponential backoff before giving up. */
async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new WeatherServiceError(`Falha na requisição: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_BASE_DELAY_MS * 2 ** attempt);
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new WeatherServiceError('Falha desconhecida ao acessar a API.');
}

const cache = new Map<string, { expiresAt: number; value: unknown }>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

/** Clears the in-memory response cache. Intended for tests. */
export function clearWeatherCache(): void {
  cache.clear();
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query.trim()) return [];

  const cacheKey = `geocoding:${query.toLowerCase()}`;
  const cached = getCached<LocationSuggestion[]>(cacheKey);
  if (cached) return cached;

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=${SUGGESTIONS_LIMIT}&language=pt&format=json`;
  const response = await fetchWithRetry(url);
  const data = (await response.json()) as RawGeocodingResponse;

  const suggestions: LocationSuggestion[] = (data.results ?? [])
    .slice(0, SUGGESTIONS_LIMIT)
    .map((result) => ({
      id: String(result.id),
      name: result.name,
      region: result.admin1 ?? '',
      country: result.country ?? '',
      latitude: result.latitude,
      longitude: result.longitude,
    }));

  setCached(cacheKey, suggestions);
  return suggestions;
}

async function fetchRawForecast(latitude: number, longitude: number): Promise<RawForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,relative_humidity_2m,precipitation,uv_index,wind_speed_10m,wind_direction_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetchWithRetry(`${FORECAST_URL}?${params.toString()}`);
  return (await response.json()) as RawForecastResponse;
}

function windDirectionLabel(degrees: number | undefined): string | null {
  if (degrees === undefined) return null;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function mapCurrentWeather(raw: RawForecastResponse): CurrentWeather {
  const current = raw.current;
  const { condition, icon } = getWeatherCodeInfo(current?.weather_code ?? -1);

  return {
    temperature: current?.temperature_2m ?? 0,
    humidity: current?.relative_humidity_2m ?? null,
    precipitation: current?.precipitation ?? null,
    uvIndex: current?.uv_index ?? null,
    windSpeed: current?.wind_speed_10m ?? null,
    windDirection: windDirectionLabel(current?.wind_direction_10m),
    condition,
    icon,
    updatedAt: current?.time ?? new Date().toISOString(),
  };
}

function mapForecastDays(raw: RawForecastResponse): ForecastDay[] {
  const daily = raw.daily;
  if (!daily?.time) return [];

  return daily.time.map((date, index) => {
    const { condition } = getWeatherCodeInfo(daily.weather_code?.[index] ?? -1);
    return {
      date,
      minTemperature: daily.temperature_2m_min?.[index] ?? 0,
      maxTemperature: daily.temperature_2m_max?.[index] ?? 0,
      condition,
      rainProbability: daily.precipitation_probability_max?.[index] ?? null,
    };
  });
}

/** Maps the raw Open-Meteo forecast response into the app's domain types. */
export function mapForecastResponse(raw: RawForecastResponse): {
  current: CurrentWeather;
  forecast: ForecastDay[];
} {
  return {
    current: mapCurrentWeather(raw),
    forecast: mapForecastDays(raw),
  };
}

export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<{ current: CurrentWeather; forecast: ForecastDay[] }> {
  const cacheKey = `weather:${latitude}:${longitude}`;
  const cached = getCached<{ current: CurrentWeather; forecast: ForecastDay[] }>(cacheKey);
  if (cached) return cached;

  const raw = await fetchRawForecast(latitude, longitude);
  const mapped = mapForecastResponse(raw);
  setCached(cacheKey, mapped);
  return mapped;
}

// Units param kept for API symmetry; conversions currently applied client-side in lib/temperature.
export type { Units };

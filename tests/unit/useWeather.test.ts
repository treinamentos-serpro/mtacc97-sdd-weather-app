import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearWeatherCache } from '../../src/services/weatherService';
import { useWeather } from '../../src/hooks/useWeather';

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

const geocodingResponse = {
  results: [
    { id: 1, name: 'São Paulo', admin1: 'SP', country: 'Brasil', latitude: -23.5, longitude: -46.6 },
  ],
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: { time: '2026-08-12T12:00:00Z', temperature_2m: 22, weather_code: 0 },
  daily: { time: ['2026-08-12'], temperature_2m_max: [25], temperature_2m_min: [18], weather_code: [0] },
};

describe('useWeather', () => {
  beforeEach(() => {
    clearWeatherCache();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      return url.includes('geocoding') ? jsonResponse(geocodingResponse) : jsonResponse(forecastResponse);
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('searches locations after debounce', async () => {
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.searchLocation('São Paulo');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));
  });

  it('clears suggestions and returns to idle for an empty search', () => {
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.searchLocation('');
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.status).toBe('idle');
  });

  it('auto-loads weather for a persisted location on mount (reload)', async () => {
    localStorage.setItem(
      'weather-app:last-location',
      JSON.stringify({
        id: '1',
        name: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        latitude: -23.5,
        longitude: -46.6,
      }),
    );

    const { result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    expect(result.current.weatherData?.location.name).toBe('São Paulo');
  });

  it('selects a location and loads weather data', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectLocation({
        id: '1',
        name: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        latitude: -23.5,
        longitude: -46.6,
      });
    });

    expect(result.current.weatherData?.current.temperature).toBe(22);
    expect(result.current.status).toBe('loaded');
  });

  it('exposes the timezone reported by the API for the selected location (not the browser timezone)', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectLocation({
        id: '1',
        name: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        latitude: -23.5,
        longitude: -46.6,
      });
    });

    expect(result.current.weatherData?.timezone).toBe('America/Sao_Paulo');
  });

  it('does not persist locations derived from geolocation to localStorage', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectLocation({
        id: 'geolocation',
        name: 'Minha localização',
        region: '',
        country: '',
        latitude: -23.5,
        longitude: -46.6,
      });
    });

    expect(localStorage.getItem('weather-app:last-location')).toBeNull();
  });

  it('clears the search query after selecting a location', async () => {
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.searchLocation('São Paulo');
    });

    await act(async () => {
      await result.current.selectLocation({
        id: '1',
        name: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        latitude: -23.5,
        longitude: -46.6,
      });
    });

    expect(result.current.searchQuery).toBe('');
  });

  it('sets an error state when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network error');
    }));
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.selectLocation({
        id: '1',
        name: 'São Paulo',
        region: 'SP',
        country: 'Brasil',
        latitude: -23.5,
        longitude: -46.6,
      });
    });

    await waitFor(() => expect(result.current.status).toBe('error'), { timeout: 5000 });
    expect(result.current.error).not.toBeNull();
  });

  it('toggles units and persists the preference', () => {
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.toggleUnits('temperature');
    });

    expect(result.current.units.temperature).toBe('fahrenheit');
    expect(JSON.parse(localStorage.getItem('weather-app:units') ?? '{}').temperature).toBe(
      'fahrenheit',
    );
  });

  it('restores persisted units on mount', () => {
    localStorage.setItem('weather-app:units', JSON.stringify({ temperature: 'fahrenheit', wind: 'mph' }));
    const { result } = renderHook(() => useWeather());

    expect(result.current.units).toEqual({ temperature: 'fahrenheit', wind: 'mph' });
  });

  it('loads weather from geolocation when permission is granted', async () => {
    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: -23.5, longitude: -46.6 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.useGeolocation();
    });

    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    expect(result.current.geoLoading).toBe(false);
  });

  it('sets geoLoading while waiting for the browser geolocation response', async () => {
    const getCurrentPosition = vi.fn((success) => {
      setTimeout(() => success({ coords: { latitude: -23.5, longitude: -46.6 } }), 50);
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.useGeolocation();
    });

    expect(result.current.geoLoading).toBe(true);

    await waitFor(() => expect(result.current.geoLoading).toBe(false));
  });

  it('keeps manual search available when geolocation permission is denied', async () => {
    const getCurrentPosition = vi.fn((_success, error) => {
      error(new Error('denied'));
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.useGeolocation();
    });

    expect(result.current.weatherData).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(typeof result.current.searchLocation).toBe('function');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearWeatherCache,
  getWeather,
  mapForecastResponse,
  searchLocations,
} from '../../src/services/weatherService';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('searchLocations', () => {
  beforeEach(() => {
    clearWeatherCache();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array for empty queries', async () => {
    expect(await searchLocations('')).toEqual([]);
  });

  it('maps up to 5 suggestions from the API response', async () => {
    const results = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      name: `Cidade ${i}`,
      admin1: 'Região',
      country: 'Brasil',
      latitude: 0,
      longitude: 0,
    }));
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ results }));

    const suggestions = await searchLocations('cidade');

    expect(suggestions).toHaveLength(5);
    expect(suggestions[0]).toEqual({
      id: '0',
      name: 'Cidade 0',
      region: 'Região',
      country: 'Brasil',
      latitude: 0,
      longitude: 0,
    });
  });

  it('returns an empty array when there are no results', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ results: [] }));
    expect(await searchLocations('inexistente')).toEqual([]);
  });

  it('throws after retries are exhausted on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'));
    await expect(searchLocations('erro')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(3); // 1 tentativa inicial + 2 retries
  });

  it('retries on server errors (5xx)', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false, 503));
    await expect(searchLocations('erro-servidor')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-retryable client errors (4xx)', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false, 404));
    await expect(searchLocations('erro-cliente')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('aborts and retries when the request times out', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );

    const promise = searchLocations('lento');
    const assertion = expect(promise).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(8000); // timeout da 1ª tentativa
    await vi.advanceTimersByTimeAsync(300); // backoff
    await vi.advanceTimersByTimeAsync(8000); // timeout da 2ª tentativa
    await vi.advanceTimersByTimeAsync(600); // backoff
    await vi.advanceTimersByTimeAsync(8000); // timeout da 3ª tentativa

    await assertion;
    expect(fetch).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});

describe('mapForecastResponse', () => {
  it('maps a complete response', () => {
    const raw = {
      current: {
        time: '2026-08-12T12:00:00Z',
        temperature_2m: 25,
        relative_humidity_2m: 60,
        precipitation: 0,
        uv_index: 5,
        wind_speed_10m: 10,
        wind_direction_10m: 90,
        weather_code: 0,
      },
      daily: {
        time: ['2026-08-12', '2026-08-13'],
        temperature_2m_max: [30, 28],
        temperature_2m_min: [20, 19],
        precipitation_probability_max: [10, 20],
        weather_code: [0, 61],
      },
    };

    const { current, forecast } = mapForecastResponse(raw);

    expect(current.temperature).toBe(25);
    expect(current.condition).toBe('Céu limpo');
    expect(forecast).toHaveLength(2);
    expect(forecast[1].condition).toContain('Chuva');
  });

  it('maps missing fields to null instead of failing', () => {
    const raw = { current: { time: '2026-08-12T12:00:00Z' }, daily: { time: ['2026-08-12'] } };

    const { current, forecast } = mapForecastResponse(raw);

    expect(current.humidity).toBeNull();
    expect(current.uvIndex).toBeNull();
    expect(forecast[0].rainProbability).toBeNull();
  });
});

describe('getWeather (cache)', () => {
  beforeEach(() => {
    clearWeatherCache();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const rawResponse = {
    current: { time: '2026-08-12T12:00:00Z', temperature_2m: 25, weather_code: 0 },
    daily: { time: ['2026-08-12'], weather_code: [0] },
  };

  it('reuses cached responses for the same coordinates', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(rawResponse));

    await getWeather(1, 2);
    await getWeather(1, 2);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches again for different coordinates', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(rawResponse));

    await getWeather(1, 2);
    await getWeather(3, 4);

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

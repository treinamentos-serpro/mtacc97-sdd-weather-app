import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { clearWeatherCache } from '../../src/services/weatherService';

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

describe('App', () => {
  beforeEach(() => {
    clearWeatherCache();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('geocoding') ? jsonResponse(geocodingResponse) : jsonResponse(forecastResponse),
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('searches, selects a location and displays the weather', async () => {
    render(<App />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'São Paulo' } });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText(/São Paulo/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/São Paulo/));

    await waitFor(() => expect(screen.getByText(/22°C/)).toBeInTheDocument());
  });

  it('shows an empty state when the search returns no results', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ results: [] })));
    render(<App />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Inexistente' } });
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText(/Nenhum resultado encontrado/)).toBeInTheDocument());
  });

  it('clears the search when the empty state clear button is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ results: [] })));
    render(<App />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Inexistente' } });
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(screen.getByText(/Nenhum resultado encontrado/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Tentar nova busca'));

    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('updates the displayed temperature when units are toggled after data is loaded', async () => {
    render(<App />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'São Paulo' } });
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(screen.getByText(/São Paulo/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/São Paulo/));
    await waitFor(() => expect(screen.getByText('22°C')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Alternar temperatura para Fahrenheit/ }));

    await waitFor(() => expect(screen.getByText('72°F')).toBeInTheDocument());
  });
});

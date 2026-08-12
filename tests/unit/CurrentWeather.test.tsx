import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { CurrentWeather as CurrentWeatherData, LocationSuggestion } from '../../src/types/weather';

const baseCurrent: CurrentWeatherData = {
  temperature: 22,
  humidity: 60,
  precipitation: 0,
  uvIndex: 5,
  windSpeed: 10,
  windDirection: 'NE',
  condition: 'Céu limpo',
  icon: '☀️',
  updatedAt: '2026-08-12T12:00:00Z',
};

const baseLocation: LocationSuggestion = {
  id: '1',
  name: 'São Paulo',
  region: 'SP',
  country: 'Brasil',
  latitude: -23.5,
  longitude: -46.6,
};

describe('CurrentWeather', () => {
  it('renders the location name so the data source is clear', () => {
    render(
      <CurrentWeather
        current={baseCurrent}
        location={baseLocation}
        units={{ temperature: 'celsius', wind: 'kmh' }}
        timezone="UTC"
      />,
    );

    expect(screen.getByText('São Paulo, SP, Brasil')).toBeInTheDocument();
  });

  it('renders all fields when data is complete', () => {
    render(
      <CurrentWeather
        current={baseCurrent}
        location={baseLocation}
        units={{ temperature: 'celsius', wind: 'kmh' }}
        timezone="UTC"
      />,
    );

    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText(/10 km\/h \(NE\)/)).toBeInTheDocument();
  });

  it('shows the unavailable message for missing fields (partial data)', () => {
    const partial: CurrentWeatherData = {
      ...baseCurrent,
      humidity: null,
      uvIndex: null,
      windSpeed: null,
      windDirection: null,
    };

    render(
      <CurrentWeather
        current={partial}
        location={baseLocation}
        units={{ temperature: 'celsius', wind: 'kmh' }}
        timezone="UTC"
      />,
    );

    expect(screen.getAllByText('dados indisponíveis no momento')).toHaveLength(3);
  });

  it('converts temperature when the unit is fahrenheit', () => {
    render(
      <CurrentWeather
        current={baseCurrent}
        location={baseLocation}
        units={{ temperature: 'fahrenheit', wind: 'kmh' }}
        timezone="UTC"
      />,
    );

    expect(screen.getByText('72°F')).toBeInTheDocument();
  });
});


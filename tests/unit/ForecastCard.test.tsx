import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import type { ForecastDay } from '../../src/types/weather';

const day: ForecastDay = {
  date: '2026-08-12',
  minTemperature: 18,
  maxTemperature: 25,
  condition: 'Céu limpo',
  rainProbability: 10,
};

describe('ForecastCard', () => {
  it('renders min/max temperature in celsius', () => {
    render(<ForecastCard day={day} temperatureUnit="celsius" timezone="UTC" />);

    expect(screen.getByText('25°C / 18°C')).toBeInTheDocument();
  });

  it('converts min/max temperature to fahrenheit', () => {
    render(<ForecastCard day={day} temperatureUnit="fahrenheit" timezone="UTC" />);

    expect(screen.getByText('77°F / 64°F')).toBeInTheDocument();
  });

  it('shows the unavailable message when rain probability is missing', () => {
    render(
      <ForecastCard day={{ ...day, rainProbability: null }} temperatureUnit="celsius" timezone="UTC" />,
    );

    expect(screen.getByText(/dados indisponíveis no momento/)).toBeInTheDocument();
  });
});

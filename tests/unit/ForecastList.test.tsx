import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import type { ForecastDay } from '../../src/types/weather';

const forecast: ForecastDay[] = [
  { date: '2026-08-12', minTemperature: 18, maxTemperature: 25, condition: 'Céu limpo', rainProbability: 10 },
  { date: '2026-08-13', minTemperature: 17, maxTemperature: 23, condition: 'Nublado', rainProbability: 30 },
];

describe('ForecastList', () => {
  it('renders one card per forecast day', () => {
    render(<ForecastList forecast={forecast} temperatureUnit="celsius" timezone="UTC" />);

    expect(screen.getByText('Céu limpo')).toBeInTheDocument();
    expect(screen.getByText('Nublado')).toBeInTheDocument();
  });

  it('exposes an accessible label for the forecast section', () => {
    render(<ForecastList forecast={forecast} temperatureUnit="celsius" timezone="UTC" />);

    expect(screen.getByLabelText('Previsão para os próximos dias')).toBeInTheDocument();
  });
});

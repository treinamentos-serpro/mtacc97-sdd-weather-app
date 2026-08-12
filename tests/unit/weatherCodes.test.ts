import { describe, expect, it } from 'vitest';
import { getWeatherCodeInfo } from '../../src/lib/weatherCodes';

describe('getWeatherCodeInfo', () => {
  it('maps clear sky code', () => {
    expect(getWeatherCodeInfo(0)).toEqual({ condition: 'Céu limpo', icon: '☀️' });
  });

  it('maps rain code', () => {
    expect(getWeatherCodeInfo(61).condition).toContain('Chuva');
  });

  it('maps cloudy code', () => {
    expect(getWeatherCodeInfo(3).condition).toBe('Nublado');
  });

  it('falls back to unknown code', () => {
    expect(getWeatherCodeInfo(9999).condition).toBe('Condição desconhecida');
  });
});

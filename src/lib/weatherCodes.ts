interface WeatherCodeInfo {
  condition: string;
  icon: string;
}

// WMO weather interpretation codes used by Open-Meteo.
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { condition: 'Céu limpo', icon: '☀️' },
  1: { condition: 'Predominantemente limpo', icon: '🌤️' },
  2: { condition: 'Parcialmente nublado', icon: '⛅' },
  3: { condition: 'Nublado', icon: '☁️' },
  45: { condition: 'Neblina', icon: '🌫️' },
  48: { condition: 'Neblina com geada', icon: '🌫️' },
  51: { condition: 'Garoa leve', icon: '🌦️' },
  53: { condition: 'Garoa moderada', icon: '🌦️' },
  55: { condition: 'Garoa intensa', icon: '🌦️' },
  61: { condition: 'Chuva leve', icon: '🌧️' },
  63: { condition: 'Chuva moderada', icon: '🌧️' },
  65: { condition: 'Chuva forte', icon: '🌧️' },
  71: { condition: 'Neve leve', icon: '🌨️' },
  73: { condition: 'Neve moderada', icon: '🌨️' },
  75: { condition: 'Neve forte', icon: '🌨️' },
  80: { condition: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { condition: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { condition: 'Pancadas de chuva violentas', icon: '⛈️' },
  95: { condition: 'Trovoada', icon: '⛈️' },
  96: { condition: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { condition: 'Trovoada com granizo forte', icon: '⛈️' },
};

const UNKNOWN_CODE: WeatherCodeInfo = { condition: 'Condição desconhecida', icon: '❓' };

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? UNKNOWN_CODE;
}

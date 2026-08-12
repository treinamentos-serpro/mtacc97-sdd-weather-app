import { celsiusToFahrenheit, kmhToMph } from '../lib/temperature';
import { formatUpdatedAt, formatValueOrUnavailable } from '../lib/format';
import type { CurrentWeather as CurrentWeatherData, LocationSuggestion, Units } from '../types/weather';

interface CurrentWeatherProps {
  current: CurrentWeatherData;
  location: LocationSuggestion;
  units: Units;
  timezone: string;
}

function CurrentWeather({ current, location, units, timezone }: CurrentWeatherProps) {
  const temperature =
    units.temperature === 'celsius' ? current.temperature : celsiusToFahrenheit(current.temperature);
  const wind =
    current.windSpeed === null
      ? null
      : units.wind === 'kmh'
        ? current.windSpeed
        : kmhToMph(current.windSpeed);
  const locationLabel = [location.name, location.region, location.country].filter(Boolean).join(', ');

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass"
    >
      <h2 className="text-lg font-medium text-white/90">{locationLabel}</h2>
      <div className="mt-2 flex items-center gap-4">
        <span aria-hidden="true" className="text-5xl">
          {current.icon}
        </span>
        <div>
          <p className="text-5xl font-semibold text-sun">
            {temperature}°{units.temperature === 'celsius' ? 'C' : 'F'}
          </p>
          <p className="text-white/80">{current.condition}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80 sm:grid-cols-3">
        <div>
          <dt className="text-white/70">Umidade</dt>
          <dd>{formatValueOrUnavailable(current.humidity !== null ? `${current.humidity}%` : null)}</dd>
        </div>
        <div>
          <dt className="text-white/70">Precipitação</dt>
          <dd>
            {formatValueOrUnavailable(
              current.precipitation !== null ? `${current.precipitation} mm` : null,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-white/70">Índice UV</dt>
          <dd>{formatValueOrUnavailable(current.uvIndex)}</dd>
        </div>
        <div>
          <dt className="text-white/70">Vento</dt>
          <dd>
            {formatValueOrUnavailable(wind !== null ? `${wind} ${units.wind === 'kmh' ? 'km/h' : 'mph'}` : null)}
            {wind !== null && ` (${formatValueOrUnavailable(current.windDirection)})`}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-white/70">
        Atualizado às {formatUpdatedAt(current.updatedAt, timezone)}
      </p>
    </section>
  );
}

export default CurrentWeather;

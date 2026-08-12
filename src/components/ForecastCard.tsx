import { celsiusToFahrenheit } from '../lib/temperature';
import { formatDateInTimezone, formatValueOrUnavailable } from '../lib/format';
import type { ForecastDay, TemperatureUnit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  temperatureUnit: TemperatureUnit;
  timezone: string;
}

function ForecastCard({ day, temperatureUnit, timezone }: ForecastCardProps) {
  const min = temperatureUnit === 'celsius' ? day.minTemperature : celsiusToFahrenheit(day.minTemperature);
  const max = temperatureUnit === 'celsius' ? day.maxTemperature : celsiusToFahrenheit(day.maxTemperature);
  const unitLabel = temperatureUnit === 'celsius' ? 'C' : 'F';

  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-white backdrop-blur-md">
      <p className="text-sm text-white/70">{formatDateInTimezone(day.date, timezone)}</p>
      <p className="mt-2 text-sm">{day.condition}</p>
      <p className="mt-2 font-semibold">
        {max}°{unitLabel} / {min}°{unitLabel}
      </p>
      <p className="mt-1 text-xs text-white/50">
        Chuva: {formatValueOrUnavailable(day.rainProbability !== null ? `${day.rainProbability}%` : null)}
      </p>
    </article>
  );
}

export default ForecastCard;

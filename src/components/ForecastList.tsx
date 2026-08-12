import ForecastCard from './ForecastCard';
import type { ForecastDay, TemperatureUnit } from '../types/weather';

interface ForecastListProps {
  forecast: ForecastDay[];
  temperatureUnit: TemperatureUnit;
  timezone: string;
}

function ForecastList({ forecast, temperatureUnit, timezone }: ForecastListProps) {
  return (
    <section aria-label="Previsão para os próximos dias" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard key={day.date} day={day} temperatureUnit={temperatureUnit} timezone={timezone} />
        ))}
      </div>
    </section>
  );
}

export default ForecastList;

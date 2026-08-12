import type { Units } from '../types/weather';

interface UnitToggleProps {
  units: Units;
  onToggle: (kind: 'temperature' | 'wind') => void;
}

function UnitToggle({ units, onToggle }: UnitToggleProps) {
  return (
    <div className="flex gap-3" role="group" aria-label="Alternar unidades de medida">
      <button
        type="button"
        onClick={() => onToggle('temperature')}
        aria-pressed={units.temperature === 'fahrenheit'}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white backdrop-blur-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500"
      >
        {units.temperature === 'celsius' ? '°C' : '°F'}
      </button>
      <button
        type="button"
        onClick={() => onToggle('wind')}
        aria-pressed={units.wind === 'mph'}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white backdrop-blur-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500"
      >
        {units.wind === 'kmh' ? 'km/h' : 'mph'}
      </button>
    </div>
  );
}

export default UnitToggle;

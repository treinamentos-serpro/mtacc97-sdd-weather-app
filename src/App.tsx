import { useWeather } from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import EmptyState from './components/states/EmptyState';

function App() {
  const {
    searchQuery,
    suggestions,
    weatherData,
    units,
    loading,
    error,
    status,
    searchLocation,
    selectLocation,
    refreshWeather,
    toggleUnits,
    useGeolocation,
    geoLoading,
  } = useWeather();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Clima Tempo</h1>

      <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <SearchBar
          query={searchQuery}
          suggestions={suggestions}
          onQueryChange={searchLocation}
          onSelect={(location) => void selectLocation(location)}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={useGeolocation}
            disabled={geoLoading}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white backdrop-blur-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-wait disabled:opacity-60"
          >
            {geoLoading ? 'Localizando…' : 'Usar minha localização'}
          </button>
          <UnitToggle units={units} onToggle={toggleUnits} />
        </div>
      </div>

      <div className="w-full">
        {loading && <LoadingState />}
        {!loading && status === 'error' && (
          <ErrorState message={error ?? 'Ocorreu um erro inesperado.'} onRetry={() => void refreshWeather()} />
        )}
        {!loading && status !== 'error' && searchQuery && suggestions.length === 0 && !weatherData && (
          <EmptyState onClear={() => searchLocation('')} />
        )}
        {!loading && status !== 'error' && weatherData && (
          <>
            <CurrentWeather
              current={weatherData.current}
              location={weatherData.location}
              units={units}
              timezone={timezone}
            />
            <ForecastList
              forecast={weatherData.forecast}
              temperatureUnit={units.temperature}
              timezone={timezone}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default App;

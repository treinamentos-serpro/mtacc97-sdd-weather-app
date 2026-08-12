import { useId, useState } from 'react';
import type { LocationSuggestion } from '../types/weather';

interface SearchBarProps {
  query: string;
  suggestions: LocationSuggestion[];
  onQueryChange: (query: string) => void;
  onSelect: (location: LocationSuggestion) => void;
}

function SearchBar({ query, suggestions, onQueryChange, onSelect }: SearchBarProps) {
  const listboxId = useId();
  const [activeIndex, setActiveIndex] = useState(-1);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      onSelect(suggestions[activeIndex]);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="location-search" className="sr-only">
        Buscar cidade, estado ou bairro
      </label>
      <input
        id="location-search"
        type="text"
        role="combobox"
        aria-expanded={suggestions.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Buscar cidade, estado ou bairro"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
      {suggestions.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-night-800/95 backdrop-blur-md shadow-glass"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => onSelect(suggestion)}
              className={`block w-full px-4 py-2 text-left text-white hover:bg-white/10 ${
                index === activeIndex ? 'bg-white/10' : ''
              }`}
            >
              {suggestion.name}
              {suggestion.region ? `, ${suggestion.region}` : ''}
              {suggestion.country ? `, ${suggestion.country}` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

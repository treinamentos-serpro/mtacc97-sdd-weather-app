import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';
import type { LocationSuggestion } from '../../src/types/weather';

const suggestions: LocationSuggestion[] = [
  { id: '1', name: 'São Paulo', region: 'SP', country: 'Brasil', latitude: 0, longitude: 0 },
  { id: '2', name: 'Salvador', region: 'BA', country: 'Brasil', latitude: 0, longitude: 0 },
];

describe('SearchBar', () => {
  it('calls onQueryChange when typing', () => {
    const onQueryChange = vi.fn();
    render(<SearchBar query="" suggestions={[]} onQueryChange={onQueryChange} onSelect={vi.fn()} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'São' } });

    expect(onQueryChange).toHaveBeenCalledWith('São');
  });

  it('calls onSelect when a suggestion is clicked', () => {
    const onSelect = vi.fn();
    render(<SearchBar query="São" suggestions={suggestions} onQueryChange={vi.fn()} onSelect={onSelect} />);

    fireEvent.click(screen.getByText(/São Paulo/));

    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('navigates suggestions with the keyboard', () => {
    const onSelect = vi.fn();
    render(<SearchBar query="São" suggestions={suggestions} onQueryChange={vi.fn()} onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('does not show a clear button when the query is empty', () => {
    render(<SearchBar query="" suggestions={[]} onQueryChange={vi.fn()} onSelect={vi.fn()} />);

    expect(screen.queryByLabelText('Limpar busca')).not.toBeInTheDocument();
  });

  it('clears the query when the clear button is clicked', () => {
    const onQueryChange = vi.fn();
    render(<SearchBar query="São" suggestions={[]} onQueryChange={onQueryChange} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Limpar busca'));

    expect(onQueryChange).toHaveBeenCalledWith('');
  });
});

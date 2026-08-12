import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('calls onToggle with "temperature" when the temperature button is clicked', () => {
    const onToggle = vi.fn();
    render(<UnitToggle units={{ temperature: 'celsius', wind: 'kmh' }} onToggle={onToggle} />);

    fireEvent.click(screen.getByText('°C'));

    expect(onToggle).toHaveBeenCalledWith('temperature');
  });

  it('calls onToggle with "wind" when the wind button is clicked', () => {
    const onToggle = vi.fn();
    render(<UnitToggle units={{ temperature: 'celsius', wind: 'kmh' }} onToggle={onToggle} />);

    fireEvent.click(screen.getByText('km/h'));

    expect(onToggle).toHaveBeenCalledWith('wind');
  });

  it('reflects the current unit selection', () => {
    render(<UnitToggle units={{ temperature: 'fahrenheit', wind: 'mph' }} onToggle={vi.fn()} />);

    expect(screen.getByText('°F')).toBeInTheDocument();
    expect(screen.getByText('mph')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from '../../src/components/states/ErrorState';

describe('ErrorState', () => {
  it('renders the error message in an alert region', () => {
    render(<ErrorState message="Algo deu errado." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado.');
  });

  it('does not render a retry button when onRetry is not provided', () => {
    render(<ErrorState message="Algo deu errado." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Algo deu errado." onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

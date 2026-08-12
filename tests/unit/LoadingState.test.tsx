import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('renders a status region announcing that data is loading', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão do tempo');
  });
});

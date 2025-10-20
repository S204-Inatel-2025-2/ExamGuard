import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router'; 
import Layout from '../dashboard';
import { expect, test, describe, vi } from 'vitest';

vi.mock('../../components/navbar', () => ({ 
  default: () => <nav data-testid="mock-navbar">Mock Navbar</nav>,
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Mock Outlet Content</div>,
  };
});

describe('Layout', () => {
  test('Root layout renders Navbar and Outlet', () => {
    render(<Layout />, { wrapper: MemoryRouter });

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();

    const layoutDiv = screen.getByTestId('mock-navbar').parentElement;
    expect(layoutDiv).toHaveClass('min-h-screen flex flex-col');
  });
});
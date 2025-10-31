import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../navbar';
import { expect, test, describe, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    Link: vi.fn(({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>),
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Mobile menu toggle functionality', async () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
    await userEvent.click(menuButton);
     
    const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);

    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
  });
});
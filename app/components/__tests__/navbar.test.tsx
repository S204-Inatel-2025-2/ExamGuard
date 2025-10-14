import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../navbar';
import { expect, test, describe, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: vi.fn(({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>),
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Renders logo and main navigation links for desktop', () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    expect(screen.getByText('ExamGuard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sobre/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /upload vídeo/i })).toHaveAttribute('href', '/upload-video');
    expect(screen.getByRole('link', { name: /upload streaming/i })).toHaveAttribute('href', '/upload-streaming');
  });

  test('Renders "Entrar" and "Cadastro" buttons for desktop', () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastro/i })).toBeInTheDocument();
  });

  test('Mobile menu toggle functionality', async () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
    await userEvent.click(menuButton);
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
    await userEvent.click(menuButton);
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
  });

  test('Navigation using "Entrar" button triggers `useNavigate`', async () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    const loginButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Home from '../home';
import { expect, test, describe, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('Renders title "ExamGuard" and description', () => {
    render(<Home />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { name: /examguard/i })).toBeInTheDocument();
    expect(screen.getByText(/assistente computacional anti-trapaça/i)).toBeInTheDocument();
  });


  test('Renders both feature cards', () => {
    render(<Home />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { name: /monitoramento em tempo real/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /relatórios inteligentes/i })).toBeInTheDocument();
  });
});
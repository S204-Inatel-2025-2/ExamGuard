import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router'; 
import LoginPage from '../login';
import { expect, test, describe, vi } from 'vitest';

vi.mock('~/components/login-form', () => ({
  LoginForm: () => <div data-testid="mock-login-form">Mock Login Form</div>,
}));

describe('LoginPage', () => {
  test('Renders LoginForm component', () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });

  test('Renders the ExamGuard logo and name', () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    expect(screen.getByText('ExamGuard')).toBeInTheDocument();
  });

  test('Renders the mascot image', () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    const mascotImage = screen.getByAltText('Image');
    expect(mascotImage).toBeInTheDocument();
    expect(mascotImage).toHaveAttribute('src', '/login-mascot.png');
  });
});
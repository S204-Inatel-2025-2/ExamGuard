import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import LoginPage, { action } from '../login';
import { expect, test, describe, vi } from 'vitest';

vi.mock('~/components/login-form', () => ({
  LoginForm: () => <div data-testid="mock-login-form">Mock Login Form</div>,
}));

describe('LoginPage', () => {
  function renderWithRouter() {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LoginPage />,
        action: action,
      },
    ]);
    return render(<RouterProvider router={router} />);
  }

  test('Renders LoginForm component', () => {
    renderWithRouter();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });

  test('Renders the ExamGuard logo and name', () => {
    renderWithRouter();
    expect(screen.getByText('ExamGuard')).toBeInTheDocument();
  });

  test('Renders the mascot image', () => {
    renderWithRouter();
    const mascotImage = screen.getByAltText('Image');
    expect(mascotImage).toBeInTheDocument();
    expect(mascotImage).toHaveAttribute('src', '/login-mascot.png');
  });
});
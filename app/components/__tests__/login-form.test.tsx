import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';
import { expect, test, describe, vi } from 'vitest';

describe('LoginForm', () => {
  test('Renders all required elements', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: /login to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/m@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument(); // Fixed: More specific query
    expect(screen.getByRole('link', { name: /forgot your password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login with github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  test('"Forgot your password?" link navigates correctly', () => {
    render(<LoginForm />);
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  test('"Login with GitHub" button has SVG icon', () => {
    render(<LoginForm />);
    const githubButton = screen.getByRole('button', { name: /login with github/i });
    expect(githubButton).toBeInTheDocument();
    expect(githubButton.querySelector('svg')).toBeInTheDocument();
  });

  test('"Sign up" link navigates correctly', () => {
    render(<LoginForm />);
    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toHaveAttribute('href', '#');
  });

  test('Form submission with valid credentials', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^Login$/i }); // Fixed: More specific query

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('Form submission with empty fields (required validation)', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^Login$/i }); // Fixed: More specific query

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    await userEvent.click(loginButton);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
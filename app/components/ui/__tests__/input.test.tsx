import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';
import { expect, test, describe, vi } from 'vitest';

describe('Input', () => {
  test('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text'); // Default type
    expect(input).toHaveClass('h-9 w-full min-w-0 rounded-md border');
  });

  test('renders with placeholder and value', () => {
    render(<Input placeholder="Enter text" defaultValue="Test Value" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveValue('Test Value');
  });

  test('handles user input (change event)', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');
    expect(handleChange).toHaveBeenCalledTimes(5);
    expect(input).toHaveValue('hello');
  });

  test('renders with aria-invalid attribute', () => {
    render(<Input aria-invalid="true" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('aria-invalid:border-destructive');
  });

  test('renders as disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  test('renders with custom type', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox'); // input de email ainda eh textbox :P
    expect(input).toHaveAttribute('type', 'email');
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';
import { expect, test, describe, vi } from 'vitest';

describe('Button', () => {
  test('renders with default variant and size', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9 px-4 py-2');
  });

  test('renders with different variant props (e.g., outline, destructive)', () => {
    render(<Button variant="outline">Outline</Button>);
    const outlineButton = screen.getByRole('button', { name: /outline/i });
    expect(outlineButton).toHaveClass('border bg-background');
    expect(outlineButton).not.toHaveClass('bg-primary');

    render(<Button variant="destructive">Destructive</Button>);
    const destructiveButton = screen.getByRole('button', { name: /destructive/i });
    expect(destructiveButton).toHaveClass('bg-destructive text-white');
  });

  test('renders with different size props (e.g., sm, lg, icon)', () => {
    render(<Button size="sm">Small</Button>);
    const smButton = screen.getByRole('button', { name: /small/i });
    expect(smButton).toHaveClass('h-8 rounded-md gap-1.5 px-3');

    render(<Button size="lg">Large</Button>);
    const lgButton = screen.getByRole('button', { name: /large/i });
    expect(lgButton).toHaveClass('h-10 rounded-md px-6');

    render(<Button size="icon">Icon</Button>);
    const iconButton = screen.getByRole('button', { name: /icon/i });
    expect(iconButton).toHaveClass('size-9');
  });

  test('renders with asChild prop', () => {
    render(<Button asChild><a href="/test">Link</a></Button>);
    const link = screen.getByRole('link', { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'button');
  });

  test('renders with an SVG icon', () => {
    render(<Button><svg data-testid="test-icon" /></Button>);
    const button = screen.getByRole('button');
    const svg = screen.getByTestId('test-icon');
    expect(button).toContainElement(svg);
  });

  test('button is disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none disabled:opacity-50');

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
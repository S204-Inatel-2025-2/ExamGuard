import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../card';
import { expect, test, describe } from 'vitest';

describe('Card and Sub-components', () => {
  test('Card renders with children', () => {
    render(<Card><p>Card Content</p></Card>);
    const card = screen.getByText('Card Content').closest('[data-slot="card"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm');
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  test('Each sub-component renders with its specific role and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card Title</CardTitle>
          <CardDescription>This is a description.</CardDescription>
          <CardAction><button>Action</button></CardAction>
        </CardHeader>
        <CardContent>
          <p>Main content here.</p>
        </CardContent>
        <CardFooter>
          <span>Footer info</span>
        </CardFooter>
      </Card>
    );

    const title = screen.getByText('My Card Title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('leading-none font-semibold');
    expect(title).toHaveAttribute('data-slot', 'card-title');

    const description = screen.getByText('This is a description.');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-muted-foreground text-sm');
    expect(description).toHaveAttribute('data-slot', 'card-description');

    const actionButton = screen.getByRole('button', { name: /action/i });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.parentElement).toHaveAttribute('data-slot', 'card-action');

    const content = screen.getByText('Main content here.').closest('[data-slot="card-content"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('px-6');

    const footer = screen.getByText('Footer info').closest('[data-slot="card-footer"]');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex items-center px-6 [.border-t]:pt-6');
  });

  test('CardAction positions itself correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardAction data-testid="card-action-element"><button>Action</button></CardAction>
        </CardHeader>
      </Card>
    );
    const cardAction = screen.getByTestId('card-action-element');
    expect(cardAction).toHaveClass('col-start-2 row-span-2 row-start-1 self-start justify-self-end');
  });
});
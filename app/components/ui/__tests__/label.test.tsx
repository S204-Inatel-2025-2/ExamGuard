import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from '../label';
import { Input } from '../input'; 
import { expect, test, describe } from 'vitest';

describe('Label', () => {
  test('renders with text content', () => {
    render(<Label>My Label</Label>);
    const label = screen.getByText('My Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-sm leading-none font-medium');
  });

  test('associates with an input using htmlFor', async () => {
    render(
      <>
        <Label htmlFor="my-input">Input Label</Label>
        <Input id="my-input" />
      </>
    );
    const label = screen.getByText('Input Label');
    const input = screen.getByLabelText('Input Label'); 
    expect(label).toHaveAttribute('for', 'my-input');
    expect(input).toBeInTheDocument();

    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  test('renders when a peer input is disabled', () => {
    render(
      <div data-group data-disabled="true">
        <Label>Disabled Label</Label>
      </div>
    );
    const label = screen.getByText('Disabled Label');
    // a classe 'peer-disabled' depende de 'peer' estar desabilitado :P
    expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
  });
});
import { cn } from '../utils';
import { expect, test, describe } from 'vitest';

describe('cn function', () => {
  test('11.1: Combines multiple class strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  test('11.2: Handles conditional classes (objects)', () => {
    expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
  });

  test('11.3: Filters out falsy values', () => {
    expect(cn('class1', null, undefined, '', 0, false, 'class2')).toBe('class1 class2');
  });

  test('11.4: Merges Tailwind CSS classes correctly', () => {
    expect(cn('p-4 px-2')).toBe('p-4 px-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  test('11.5: Handles empty inputs', () => {
    expect(cn()).toBe('');
  });
});
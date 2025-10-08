import { cn } from '../utils';
import { expect, test, describe } from 'vitest';

describe('cn function', () => {
  test('Combines multiple class strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  test('Handles conditional classes (objects)', () => {
    expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
  });

  test('Filters out falsy values', () => {
    expect(cn('class1', null, undefined, '', 0, false, 'class2')).toBe('class1 class2');
  });

  test('Merges Tailwind CSS classes correctly', () => {
    expect(cn('p-4 px-2')).toBe('p-4 px-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  test('Handles empty inputs', () => {
    expect(cn()).toBe('');
  });
});
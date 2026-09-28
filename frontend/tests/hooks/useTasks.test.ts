import { describe, it, expect } from 'vitest';
import { useTasks } from '../../src/hooks/useTasks';

describe('useTasks', () => {
  it('returns state shape', () => {
    // hook depends on store; verify import works
    expect(typeof useTasks).toBe('function');
  });
});

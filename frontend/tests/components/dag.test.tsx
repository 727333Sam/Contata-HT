import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DAGVisualizer } from '../../src/components/dag/DAGVisualizer';

describe('DAGVisualizer', () => {
  it('renders canvas area', () => {
    render(<DAGVisualizer />);
    expect(screen.getByText(/DAG/)).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../../src/components/kanban/KanbanBoard';

describe('KanbanBoard', () => {
  it('renders columns', () => {
    render(<KanbanBoard />);
    expect(screen.getByText(/backlog/i)).toBeDefined();
    expect(screen.getByText(/in progress/i)).toBeDefined();
  });
});

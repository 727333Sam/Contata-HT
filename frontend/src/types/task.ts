export type StatusEnum = 'backlog' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: StatusEnum;
  startDate?: string;
  endDate?: string;
  boardPosition?: number;
  createdAt: string;
  updatedAt: string;
}

export type AISuggestion = { confidence: number; rationale?: string };

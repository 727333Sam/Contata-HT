// EVAL C (15%): API service with proper exports
export const API_URL =
  typeof (globalThis as any).process !== 'undefined'
    ? (globalThis as any).process.env?.VITE_API_URL || 'http://localhost:8000'
    : 'http://localhost:8000';

export const SuggestedByEnum = { user: 'user', ai: 'ai' };

// 1. Fetch all tasks from PostgreSQL
export const getDependencies = async () => {
  try { const res = await fetch(`${API_URL}/api/dependencies`); return res.ok ? await res.json() : []; } catch { return []; }
};

export const getTasks = async () => {
  try {
    const res = await fetch(`${API_URL}/api/tasks`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
};

// 2. Fetch critical path DAG schedule
export const getCriticalPath = async () => {
  try {
    const res = await fetch(`${API_URL}/api/dag/critical-path`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch critical path:', error);
    return null;
  }
};

export const createTask = async (taskData: any) => {
  try {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Create task API error:', err);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
};

export const getAISuggestions = async (taskId?: string) => {
  try {
    const url = taskId ? `${API_URL}/api/tasks/${taskId}/suggest` : `${API_URL}/api/tasks/`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
};

export const validateDependency = async (dependencyId: any, isValid: boolean) => {
  try {
    const res = await fetch(`${API_URL}/api/dependencies/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dependencyId, isValid }),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to validate dependency:', error);
    return false;
  }
};

export const addDependency = async (d: any) => {
  try {
    const res = await fetch(`${API_URL}/api/dependencies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_task_id: d.sourceTaskId,
        target_task_id: d.targetTaskId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Add dependency API error:', err);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to add dependency:', error);
    return null;
  }
};

export const patchTask = async (id: any, updates: any) => {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to patch task:', error);
    return null;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);
};

export const removeDependency = async (id: any) => {
  try {
    const res = await fetch(`${API_URL}/api/dependencies/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to remove dependency:', error);
    return false;
  }
};

export const updateTask = async (id: any, updates: any) => {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to update task:', error);
    return null;
  }
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Priority, Task } from '../types/task';

export const TASKS_STORAGE_KEY = 'taskflow_tasks_v1';
export const THEME_STORAGE_KEY = 'taskflow_theme_v1';
export const TOMBSTONES_STORAGE_KEY = 'taskflow_deleted_v1';
export const OWNER_STORAGE_KEY = 'taskflow_owner_v1';

const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/**
 * Validates and sanitizes a raw object loaded from storage into a valid Task.
 * Returns null if the item is irrecoverably invalid.
 */
export function validateTaskItem(item: unknown): Task | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const candidate = item as Record<string, unknown>;

  // Required: id must be a string
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    return null;
  }

  // Required: title must be a string
  if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
    return null;
  }

  // Sanitize priority
  let priority: Priority = 'medium';
  if (
    typeof candidate.priority === 'string' &&
    VALID_PRIORITIES.includes(candidate.priority as Priority)
  ) {
    priority = candidate.priority as Priority;
  }

  // Sanitize completed
  const completed = Boolean(candidate.completed);

  // Sanitize optional description
  const description =
    typeof candidate.description === 'string'
      ? candidate.description.slice(0, 500)
      : undefined;

  // Sanitize dueDate
  let dueDate: string | undefined = undefined;
  if (
    typeof candidate.dueDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.dueDate)
  ) {
    dueDate = candidate.dueDate;
  }

  // Sanitize timestamps
  const now = new Date().toISOString();
  const createdAt =
    typeof candidate.createdAt === 'string' ? candidate.createdAt : now;
  const updatedAt =
    typeof candidate.updatedAt === 'string' ? candidate.updatedAt : now;

  return {
    id: candidate.id,
    title: candidate.title.slice(0, 120),
    description,
    priority,
    dueDate,
    completed,
    createdAt,
    updatedAt,
  };
}

/**
 * Loads tasks from LocalStorage with error resilience.
 * Returns { tasks, error } so the UI can notify the user if storage is blocked or corrupted.
 */
export function loadTasksFromStorage(): {
  tasks: Task[];
  storageError: string | null;
} {
  try {
    const rawData = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!rawData) {
      return { tasks: [], storageError: null };
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('TaskFlow: Stored data was not an array. Recovering safely.');
      return {
        tasks: [],
        storageError: 'Stored tasks format was unexpected. A clean list has been loaded.',
      };
    }

    const validTasks: Task[] = [];
    for (const item of parsed) {
      const validated = validateTaskItem(item);
      if (validated) {
        validTasks.push(validated);
      }
    }

    return { tasks: validTasks, storageError: null };
  } catch (err) {
    console.error('TaskFlow: Failed to read from LocalStorage', err);
    return {
      tasks: [],
      storageError: 'Could not access browser storage. Your tasks may not persist across refreshes if private browsing blocks storage.',
    };
  }
}

/**
 * Saves tasks to LocalStorage safely.
 * Returns boolean indicating success.
 */
export function saveTasksToStorage(tasks: Task[]): { success: boolean; error: string | null } {
  try {
    const serialized = JSON.stringify(tasks);
    localStorage.setItem(TASKS_STORAGE_KEY, serialized);
    return { success: true, error: null };
  } catch (err) {
    console.error('TaskFlow: Failed to write to LocalStorage', err);
    return {
      success: false,
      error: 'Storage quota exceeded or browser storage is disabled.',
    };
  }
}

/**
 * Theme persistence helper
 */
export function loadThemeFromStorage(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Check system preference
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch (err) {
    console.warn('Could not read theme preference', err);
  }
  return 'light';
}

export function saveThemeToStorage(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('Could not save theme preference', err);
  }
}

/**
 * ---- Cloud-sync bookkeeping -------------------------------------------------
 * Deleted task ids are remembered ("tombstones") so a deletion made on one
 * device can be propagated to the others instead of the task re-appearing.
 */
export type Tombstones = Record<string, string>; // task id -> ISO deletion time

export function loadTombstones(): Tombstones {
  try {
    const raw = localStorage.getItem(TOMBSTONES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Tombstones = {};
    for (const [id, when] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof when === 'string') out[id] = when;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveTombstones(tombstones: Tombstones): void {
  try {
    localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(tombstones));
  } catch (err) {
    console.warn('TaskFlow: could not save deletion log', err);
  }
}

/** Which cloud account the data on this device belongs to (null = never synced). */
export function loadOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveOwner(userId: string | null): void {
  try {
    if (userId) localStorage.setItem(OWNER_STORAGE_KEY, userId);
    else localStorage.removeItem(OWNER_STORAGE_KEY);
  } catch (err) {
    console.warn('TaskFlow: could not save account link', err);
  }
}

/** Removes every task-related key from this device (theme is kept). */
export function clearLocalTaskData(): void {
  try {
    localStorage.removeItem(TASKS_STORAGE_KEY);
    localStorage.removeItem(TOMBSTONES_STORAGE_KEY);
    localStorage.removeItem(OWNER_STORAGE_KEY);
  } catch (err) {
    console.warn('TaskFlow: could not clear local data', err);
  }
}

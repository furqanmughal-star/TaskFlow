/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 * Used for date picker min attributes and accurate date comparisons.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats current date for display in the US standard format.
 * Example: "Friday, Oct 23, 2026"
 */
export function formatFriendlyDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object without UTC drift.
 */
export function parseLocalDateString(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const parsed = new Date(year, month, day);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a YYYY-MM-DD string into a clean US date representation.
 * Example: "Oct 30, 2026"
 */
export function formatDueDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  const date = parseLocalDateString(dateStr);
  if (!date) return dateStr;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Determines whether a task with a given due date is overdue.
 * Tasks without due dates or completed tasks are never classified as overdue.
 * A task due today is NOT overdue.
 */
export function isTaskOverdue(dueDateStr?: string, completed: boolean = false): boolean {
  if (completed || !dueDateStr) {
    return false;
  }
  const todayStr = getTodayDateString();
  // Safe string comparison for YYYY-MM-DD format works accurately because ISO date strings are lexicographically sortable
  return dueDateStr < todayStr;
}

/**
 * Checks if a task is due today.
 */
export function isTaskDueToday(dueDateStr?: string, completed: boolean = false): boolean {
  if (completed || !dueDateStr) {
    return false;
  }
  return dueDateStr === getTodayDateString();
}

/**
 * Returns a human-friendly due date status label with contextual urgency.
 */
export function getDueDateStatus(dueDateStr?: string, completed: boolean = false): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
} {
  if (!dueDateStr) {
    return { label: '', isOverdue: false, isDueToday: false };
  }

  const todayStr = getTodayDateString();
  const formatted = formatDueDateDisplay(dueDateStr);

  if (completed) {
    return { label: formatted, isOverdue: false, isDueToday: false };
  }

  if (dueDateStr < todayStr) {
    // Calculate days overdue
    const today = parseLocalDateString(todayStr);
    const due = parseLocalDateString(dueDateStr);
    if (today && due) {
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const daysText = diffDays === 1 ? '1 day' : `${diffDays} days`;
      return { label: `Overdue by ${daysText} (${formatted})`, isOverdue: true, isDueToday: false };
    }
    return { label: `Overdue (${formatted})`, isOverdue: true, isDueToday: false };
  }

  if (dueDateStr === todayStr) {
    return { label: 'Due today', isOverdue: false, isDueToday: true };
  }

  // Calculate days remaining
  const today = parseLocalDateString(todayStr);
  const due = parseLocalDateString(dueDateStr);
  if (today && due) {
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return { label: 'Due tomorrow', isOverdue: false, isDueToday: false };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days (${formatted})`, isOverdue: false, isDueToday: false };
    }
  }

  return { label: `Due ${formatted}`, isOverdue: false, isDueToday: false };
}

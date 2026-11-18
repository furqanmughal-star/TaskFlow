/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'active' | 'completed';

export type SortOption = 'newest' | 'oldest' | 'dueDate' | 'priority';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // Stored in YYYY-MM-DD format
  completed: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number; // percentage 0 - 100
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

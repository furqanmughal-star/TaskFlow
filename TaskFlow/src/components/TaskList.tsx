/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, ClipboardList, SearchX, PlusCircle } from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  hasActiveFilters,
  onResetFilters,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  // Empty State 1: No tasks exist in the app at all
  if (totalTasksCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
          Your task list is clear
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Stay organized and boost your daily productivity. Use the input form above to add your first task.
        </p>
      </div>
    );
  }

  // Empty State 2: Tasks exist, but none match current search or filters
  if (tasks.length === 0 && hasActiveFilters) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 text-center shadow-xs">
        <div className="w-11 h-11 mx-auto mb-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          No matching tasks found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          We couldn&apos;t find any tasks matching your current search terms or filter selection.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  // Render Tasks List
  return (
    <div className="space-y-3" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

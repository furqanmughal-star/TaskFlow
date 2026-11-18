/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Check,
  Calendar,
  AlertCircle,
  Flag,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import { Task, Priority } from '../types/task';
import { getDueDateStatus } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { label: dueDateLabel, isOverdue, isDueToday } = getDueDateStatus(
    task.dueDate,
    task.completed
  );

  // Priority metadata with accessible text and distinct icon styling
  const priorityConfig: Record<
    Priority,
    { label: string; textClass: string; bgClass: string; icon: React.ReactNode }
  > = {
    high: {
      label: 'High Priority',
      textClass: 'text-red-700 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-950/40 border-red-200/80 dark:border-red-900/60',
      icon: <Flag className="w-3 h-3 fill-red-500/20 text-red-600 dark:text-red-400" />,
    },
    medium: {
      label: 'Medium Priority',
      textClass: 'text-amber-700 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60',
      icon: <Flag className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
    },
    low: {
      label: 'Low Priority',
      textClass: 'text-blue-700 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60',
      icon: <Flag className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
    },
  };

  const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      className={`group relative rounded-xl border p-4 sm:p-4.5 transition-all bg-white dark:bg-slate-900 shadow-xs hover:shadow-sm ${
        task.completed
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80 bg-slate-50/50 dark:bg-slate-900/40'
          : isOverdue
          ? 'border-amber-300 dark:border-amber-900/70 hover:border-amber-400'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as completed`
          }
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-sm font-semibold tracking-tight leading-snug break-words ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Action buttons (Edit & Delete) */}
            <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit task: ${task.title}`}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Edit task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete task: ${task.title}`}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description text */}
          {task.description && (
            <p
              className={`mt-1.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadata Row: Priority, Due Date, and Status */}
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${priorityMeta.bgClass} ${priorityMeta.textClass}`}
            >
              {priorityMeta.icon}
              <span>{priorityMeta.label}</span>
            </span>

            {/* Due Date Indicator */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  task.completed
                    ? 'text-slate-400 dark:text-slate-500'
                    : isOverdue
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : isDueToday
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>{dueDateLabel}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

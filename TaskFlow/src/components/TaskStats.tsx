/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { TaskStats as ITaskStats } from '../types/task';

interface TaskStatsProps {
  stats: ITaskStats;
  currentFilter: string;
  onFilterClick: (filter: 'all' | 'active' | 'completed') => void;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  stats,
  currentFilter,
  onFilterClick,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Tasks Card */}
      <button
        type="button"
        onClick={() => onFilterClick('all')}
        className={`text-left p-4 rounded-xl border transition-all text-slate-800 dark:text-slate-200 ${
          currentFilter === 'all'
            ? 'bg-white dark:bg-slate-800/90 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-xs'
            : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80'
        }`}
        aria-label={`Total tasks: ${stats.total}. Click to show all tasks.`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Tasks
          </span>
          <ListTodo className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          {stats.total}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
          All created items
        </span>
      </button>

      {/* Active Tasks Card */}
      <button
        type="button"
        onClick={() => onFilterClick('active')}
        className={`text-left p-4 rounded-xl border transition-all text-slate-800 dark:text-slate-200 ${
          currentFilter === 'active'
            ? 'bg-white dark:bg-slate-800/90 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-xs'
            : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80'
        }`}
        aria-label={`Active tasks: ${stats.active}. Click to filter active tasks.`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active
          </span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
          {stats.active}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
          In progress
        </span>
      </button>

      {/* Completed Tasks Card */}
      <button
        type="button"
        onClick={() => onFilterClick('completed')}
        className={`text-left p-4 rounded-xl border transition-all text-slate-800 dark:text-slate-200 ${
          currentFilter === 'completed'
            ? 'bg-white dark:bg-slate-800/90 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-xs'
            : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80'
        }`}
        aria-label={`Completed tasks: ${stats.completed}. Click to filter completed tasks.`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Completed
          </span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
          {stats.completed}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
          Successfully finished
        </span>
      </button>

      {/* Overdue Tasks Card */}
      <div
        className={`p-4 rounded-xl border ${
          stats.overdue > 0
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50'
            : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overdue
          </span>
          <AlertTriangle
            className={`w-4 h-4 ${
              stats.overdue > 0 ? 'text-amber-500' : 'text-slate-400'
            }`}
          />
        </div>
        <div
          className={`text-2xl font-bold font-mono tabular-nums ${
            stats.overdue > 0
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {stats.overdue}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
          {stats.overdue > 0 ? 'Past scheduled deadline' : 'Zero overdue items'}
        </span>
      </div>
    </div>
  );
};

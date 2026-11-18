/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { TaskStats } from '../types/task';

interface WelcomeSectionProps {
  stats: TaskStats;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ stats }) => {
  const isAllDone = stats.total > 0 && stats.active === 0;

  return (
    <section className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              Make today count.
            </h2>
            {isAllDone && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Complete
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {stats.total === 0
              ? 'Organize your goals, track deadlines, and stay on top of what matters most today.'
              : isAllDone
              ? "Outstanding work! You have finished everything on your list. Take a breather or add new priorities."
              : `You have completed ${stats.completed} of ${stats.total} tasks. Keep up the momentum!`}
          </p>
        </div>

        {/* Progress Display */}
        {stats.total > 0 && (
          <div className="shrink-0 w-full md:w-64 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span className="text-slate-500 dark:text-slate-400">Daily Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono tabular-nums font-semibold">
                {stats.completionRate}%
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div
              className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={stats.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion progress"
            >
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between tabular-nums font-mono">
              <span>{stats.active} remaining</span>
              <span>{stats.completed} done</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

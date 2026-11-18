/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckSquare, Cloud, CloudOff, Download, Moon, RefreshCw, Sun } from 'lucide-react';
import { formatFriendlyDate } from '../utils/dateUtils';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeCount: number;
  totalCount: number;
  onOpenSubmissionModal?: () => void;
  /** Cloud sync (all optional — omitted props keep the original local-only header). */
  cloudEnabled?: boolean;
  cloudState?: 'signed-out' | 'idle' | 'syncing' | 'offline' | 'error';
  onOpenCloud?: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeCount,
  totalCount,
  onOpenSubmissionModal,
  cloudEnabled = false,
  cloudState = 'signed-out',
  onOpenCloud,
  canInstall = false,
  onInstall,
}) => {
  const currentDate = formatFriendlyDate();

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              TaskFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden sm:block">
              Smart Personal Task Manager
            </p>
          </div>
        </div>

        {/* Date, Telemetry, and Submission Deliverables */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="hidden lg:flex items-center gap-2 font-medium">
            <span className="text-slate-500 dark:text-slate-400">Today:</span>
            <span>{currentDate}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="tabular-nums font-mono">
              {activeCount} of {totalCount} remaining
            </span>
          </div>

          {onOpenSubmissionModal && (
            <button
              type="button"
              onClick={onOpenSubmissionModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download Word Document, PDF, and Project ZIP archive"
            >
              <span>Internship Report & Zip</span>
            </button>
          )}

          {canInstall && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Install TaskFlow as an app on this device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install app</span>
            </button>
          )}

          {cloudEnabled && onOpenCloud && (
            <button
              type="button"
              onClick={onOpenCloud}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={
                cloudState === 'signed-out'
                  ? 'Sign in to sync your tasks'
                  : cloudState === 'syncing'
                  ? 'Syncing…'
                  : cloudState === 'offline'
                  ? 'Offline — changes will sync later'
                  : cloudState === 'error'
                  ? 'Sync problem — tap for details'
                  : 'Synced'
              }
              aria-label="Cloud sync"
            >
              {cloudState === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              ) : cloudState === 'signed-out' || cloudState === 'offline' ? (
                <CloudOff className="w-3.5 h-3.5" />
              ) : (
                <Cloud
                  className={`w-3.5 h-3.5 ${cloudState === 'error' ? 'text-red-500' : 'text-emerald-500'}`}
                />
              )}
              <span className="hidden sm:inline font-medium">
                {cloudState === 'signed-out' ? 'Sign in' : cloudState === 'error' ? 'Sync issue' : 'Synced'}
              </span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

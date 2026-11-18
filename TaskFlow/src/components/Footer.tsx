/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Download, Upload, ShieldCheck, Heart } from 'lucide-react';
import { Task } from '../types/task';

interface FooterProps {
  tasks: Task[];
  onImportTasks: (importedTasks: Task[]) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Footer: React.FC<FooterProps> = ({
  tasks,
  onImportTasks,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe Export JSON backup
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Task backup downloaded successfully.', 'success');
    } catch (err) {
      console.error('Failed to export tasks', err);
      onShowToast('Could not export tasks file.', 'error');
    }
  };

  // Safe Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('Imported JSON is not an array of tasks.');
        }
        onImportTasks(parsed);
      } catch (err) {
        console.error('Failed to parse backup file', err);
        onShowToast('Invalid backup file. Please select a valid TaskFlow JSON file.', 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 pt-8 pb-12 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span>TaskFlow</span>
              <span aria-hidden="true">·</span>
              <span className="font-normal text-slate-500 dark:text-slate-400">
                Your focused, personal productivity hub
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Private & Local-First: All tasks stay strictly in your browser&apos;s LocalStorage.</span>
            </p>
          </div>

          {/* Backup / Restore Controls */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              aria-label="Upload JSON backup file"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs"
              title="Restore tasks from a JSON backup file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>
            <button
              type="button"
              onClick={handleExportData}
              disabled={tasks.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Download your tasks as a JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tasks</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 text-center text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap justify-center items-center gap-3">
          <span>Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to add</span>
          <span>·</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd> to cancel dialogs</span>
          <span>·</span>
          <span>Designed with care for modern web workflows</span>
        </div>
      </div>
    </footer>
  );
};

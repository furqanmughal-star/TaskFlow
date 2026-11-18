/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Plus, Calendar, AlertCircle, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { Priority } from '../types/task';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskFormProps {
  onAddTask: (taskData: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }) => boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) return;

    const trimmedTitle = title.trim();

    // Validation: Empty or whitespace title
    if (!trimmedTitle) {
      setErrorMessage('Please enter a task title before adding.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length > 120) {
      setErrorMessage('Task title cannot exceed 120 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const success = onAddTask({
      title: trimmedTitle,
      description: description.trim() ? description.trim().slice(0, 500) : undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    if (success) {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setShowDetails(false);
      titleInputRef.current?.focus();
    }

    // Micro-delay to avoid double-click duplicates
    setTimeout(() => {
      setIsSubmitting(false);
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.target instanceof HTMLInputElement) {
        e.preventDefault();
        handleSubmit();
      } else if (e.target instanceof HTMLTextAreaElement && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-all">
      <form onSubmit={handleSubmit} noValidate>
        {/* Main Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              ref={titleInputRef}
              type="text"
              id="new-task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={120}
              placeholder="What do you need to accomplish? (e.g. Prepare quarterly review)"
              className={`w-full h-11 px-4 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border transition-all text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                errorMessage
                  ? 'border-red-400 dark:border-red-500/80 ring-1 ring-red-400/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              aria-label="New task title"
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? 'task-title-error' : undefined}
            />
            {title.length > 90 && (
              <span className="absolute right-3 top-3 text-[11px] font-mono tabular-nums text-slate-400">
                {120 - title.length}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div
            id="task-title-error"
            role="alert"
            className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Details Toggle Header */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
            aria-expanded={showDetails}
            aria-controls="task-creation-details"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>{showDetails ? 'Hide additional details' : 'Add priority, due date, or notes'}</span>
          </button>

          {/* Quick inline preview if details hidden but values set */}
          {!showDetails && (priority !== 'medium' || dueDate) && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              {priority !== 'medium' && <span>Priority: {priority}</span>}
              {dueDate && <span>Due: {dueDate}</span>}
            </div>
          )}
        </div>

        {/* Expandable Optional Details Section */}
        {showDetails && (
          <div
            id="task-creation-details"
            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Priority Selector */}
            <div>
              <label
                htmlFor="new-task-priority"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                    priority === 'low'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>Low</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                    priority === 'medium'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>Medium</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                    priority === 'high'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>High</span>
                </button>
              </div>
            </div>

            {/* Due Date Picker */}
            <div>
              <label
                htmlFor="new-task-due-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Due Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="new-task-due-date"
                  value={dueDate}
                  min={getTodayDateString()}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Optional Description / Notes */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="new-task-description"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Notes & Description (Optional)
                </label>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {description.length}/500
                </span>
              </div>
              <textarea
                id="new-task-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                placeholder="Add supporting details, links, or sub-points... (Press Ctrl+Enter to save)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-y"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

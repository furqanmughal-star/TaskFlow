/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types/task';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setErrorMessage(null);
      // Auto-focus input on opening
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [task, isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage('Task title cannot be empty.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length > 120) {
      setErrorMessage('Task title cannot exceed 120 characters.');
      return;
    }

    const updatedTask: Task = {
      ...task,
      title: trimmedTitle,
      description: description.trim() ? description.trim().slice(0, 500) : undefined,
      priority,
      dueDate: dueDate || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedTask);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2
            id="edit-task-modal-title"
            className="text-base font-semibold text-slate-900 dark:text-white"
          >
            Edit Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="edit-task-title"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Task Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                {title.length}/120
              </span>
            </div>
            <input
              ref={titleInputRef}
              type="text"
              id="edit-task-title"
              value={title}
              maxLength={120}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                errorMessage
                  ? 'border-red-400 ring-1 ring-red-400/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              required
            />
            {errorMessage && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-medium rounded-md capitalize transition-all flex items-center justify-center gap-1 ${
                      priority === p
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="edit-task-due-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="edit-task-due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="edit-task-desc"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Notes & Description
              </label>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                {description.length}/500
              </span>
            </div>
            <textarea
              id="edit-task-desc"
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              placeholder="Add optional notes..."
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-600/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { WelcomeSection } from './components/WelcomeSection';
import { TaskStats } from './components/TaskStats';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskEditModal } from './components/TaskEditModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SubmissionModal } from './components/SubmissionModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import {
  Task,
  Priority,
  FilterStatus,
  SortOption,
  TaskStats as ITaskStats,
  ToastMessage,
} from './types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadThemeFromStorage,
  saveThemeToStorage,
} from './utils/storage';
import { isTaskOverdue } from './utils/dateUtils';
import { loadTombstones, saveTombstones } from './utils/storage';
import { useCloud } from './utils/useCloud';
import { useInstallPrompt } from './utils/pwa';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  // --- Persistent State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  // Always-current copy of the list (used by persist() and the cloud sync, which run outside React renders).
  const tasksRef = useRef<Task[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadThemeFromStorage());
  const [storageErrorBanner, setStorageErrorBanner] = useState<string | null>(null);

  // --- Filtering & Sorting State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // --- Modals State ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isClearCompletedModalOpen, setIsClearCompletedModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- Toast Notifications State ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show Toast Helper
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Cloud sync (optional) & installable-app prompt ---
  const cloud = useCloud({
    getTasks: () => tasksRef.current,
    onTasksMerged: (merged) => {
      tasksRef.current = merged;
      setTasks(merged);
      saveTasksToStorage(merged);
    },
  });
  const { canInstall, install } = useInstallPrompt();

  /**
   * Single place where the task list changes: updates state, writes to storage,
   * records deletions (so other devices can remove them too) and asks the cloud to sync.
   */
  const persist = useCallback(
    (next: Task[]): { success: boolean; error: string | null } => {
      const nextIds = new Set(next.map((t) => t.id));
      const removed = tasksRef.current.filter((t) => !nextIds.has(t.id));
      const tombstones = loadTombstones();
      let tombstonesChanged = false;
      const now = new Date().toISOString();
      for (const t of removed) {
        tombstones[t.id] = now;
        tombstonesChanged = true;
      }
      for (const id of nextIds) {
        if (id in tombstones) {
          delete tombstones[id];
          tombstonesChanged = true;
        }
      }
      if (tombstonesChanged) saveTombstones(tombstones);

      tasksRef.current = next;
      setTasks(next);
      const result = saveTasksToStorage(next);
      cloud.requestSync();
      return result;
    },
    [cloud.requestSync] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // --- Initialize App & Load from Storage ---
  useEffect(() => {
    const { tasks: initialTasks, storageError } = loadTasksFromStorage();
    tasksRef.current = initialTasks;
    setTasks(initialTasks);
    if (storageError) {
      setStorageErrorBanner(storageError);
    }
  }, []);

  // --- Apply & Sync Theme with HTML element ---
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemeToStorage(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // --- Calculate Statistics ---
  const stats: ITaskStats = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let overdue = 0;

    for (const task of tasks) {
      if (task.completed) {
        completed++;
      } else if (isTaskOverdue(task.dueDate, task.completed)) {
        overdue++;
      }
    }

    const active = total - completed;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, active, completed, overdue, completionRate };
  }, [tasks]);

  // --- Task CRUD Operations ---

  // Add Task
  const handleAddTask = (taskData: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }): boolean => {
    const now = new Date().toISOString();
    // Unique ID generation with fallback
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    const newTask: Task = {
      id,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [newTask, ...tasksRef.current];
    const { success, error } = persist(updatedTasks);
    if (!success) {
      showToast(error || 'Failed to persist task in storage.', 'error');
      return false;
    }

    showToast('Task added successfully.', 'success');
    return true;
  };

  // Toggle Complete / Incomplete
  const handleToggleComplete = (id: string) => {
    const updatedTasks = tasksRef.current.map((task) => {
      if (task.id === id) {
        const nextState = !task.completed;
        return {
          ...task,
          completed: nextState,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });

    persist(updatedTasks);

    const toggled = updatedTasks.find((t) => t.id === id);
    if (toggled?.completed) {
      showToast('Task marked as completed.', 'success');
    } else {
      showToast('Task reopened.', 'info');
    }
  };

  // Trigger Edit Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // Save Edited Task
  const handleSaveEditedTask = (updatedTask: Task) => {
    const updatedTasks = tasksRef.current.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    persist(updatedTasks);
    showToast('Task updated successfully.', 'success');
  };

  // Trigger Delete Modal
  const handleOpenDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const updatedTasks = tasksRef.current.filter((t) => t.id !== taskToDelete.id);
    persist(updatedTasks);
    showToast(`Task "${taskToDelete.title}" deleted.`, 'info');
    setTaskToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Confirm Clear All Completed
  const handleConfirmClearCompleted = () => {
    const activeTasks = tasksRef.current.filter((t) => !t.completed);
    const countCleared = tasksRef.current.length - activeTasks.length;
    persist(activeTasks);
    showToast(`Cleared ${countCleared} completed ${countCleared === 1 ? 'task' : 'tasks'}.`, 'info');
    setIsClearCompletedModalOpen(false);
  };

  // Import Backup Tasks
  const handleImportTasks = (importedTasks: Task[]) => {
    // Validate each imported task
    if (!Array.isArray(importedTasks) || importedTasks.length === 0) {
      showToast('No tasks found in import file.', 'warning');
      return;
    }
    // Tasks that are new to this device get a fresh timestamp so a restored backup is never
    // overruled by an older deletion that already synced to the cloud.
    const knownIds = new Set(tasksRef.current.map((t) => t.id));
    const stamp = new Date().toISOString();
    const prepared = importedTasks.map((t) => (knownIds.has(t.id) ? t : { ...t, updatedAt: stamp }));
    persist(prepared);
    showToast(`Imported ${importedTasks.length} tasks successfully.`, 'success');
  };

  // --- Filter and Sort Logic ---
  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterPriority !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setSortOption('newest');
    showToast('Filters reset.', 'info');
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search Query Filter (Title & Description, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // 2. Status Filter
    if (filterStatus === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // 3. Priority Filter
    if (filterPriority !== 'all') {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'dueDate') {
        // Items with due dates come first, sorted chronologically
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortOption === 'priority') {
        const priorityWeights: Record<Priority, number> = {
          high: 3,
          medium: 2,
          low: 1,
        };
        const diff = priorityWeights[b.priority] - priorityWeights[a.priority];
        if (diff !== 0) return diff;
        // Secondary sort: newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, sortOption]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeCount={stats.active}
        totalCount={stats.total}
        onOpenSubmissionModal={() => setIsSubmissionModalOpen(true)}
        cloudEnabled={cloud.configured}
        cloudState={
          !cloud.user || cloud.status === 'signed-out' || cloud.status === 'unconfigured'
            ? 'signed-out'
            : cloud.status
        }
        onOpenCloud={() => setIsAuthModalOpen(true)}
        canInstall={canInstall}
        onInstall={() => void install()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Storage Warning Banner if storage is restricted */}
        {storageErrorBanner && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 flex items-start justify-between gap-3 text-xs text-amber-800 dark:text-amber-300"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{storageErrorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStorageErrorBanner(null)}
              className="p-1 text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-100"
              aria-label="Dismiss storage warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Welcome & Motivational Section */}
        <WelcomeSection stats={stats} />

        {/* Task Statistics Grid */}
        <TaskStats
          stats={stats}
          currentFilter={filterStatus}
          onFilterClick={(filter) => setFilterStatus(filter)}
        />

        {/* Task Creation Form */}
        <TaskForm onAddTask={handleAddTask} />

        {/* Task Management Section (Search, Filters, Sort) */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          completedCount={stats.completed}
          onClearCompletedClick={() => setIsClearCompletedModalOpen(true)}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={handleResetFilters}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredAndSortedTasks}
          totalTasksCount={tasks.length}
          hasActiveFilters={activeFiltersCount > 0}
          onResetFilters={handleResetFilters}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </main>

      {/* Edit Task Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEditedTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
      />

      {/* Clear Completed Tasks Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearCompletedModalOpen}
        title="Clear All Completed Tasks"
        message={`Are you sure you want to remove all ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        }? Active tasks will remain untouched.`}
        confirmLabel="Clear Completed"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmClearCompleted}
        onCancel={() => setIsClearCompletedModalOpen(false)}
      />

      {/* Internship Submission Files Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
      />

      {/* Cloud account / sync dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        configured={cloud.configured}
        user={cloud.user}
        status={cloud.status}
        lastSyncedAt={cloud.lastSyncedAt}
        errorMessage={cloud.errorMessage}
        onSignIn={async (email, password) => {
          await cloud.signIn(email, password);
          setIsAuthModalOpen(false);
        }}
        onSignUp={async (email, password) => {
          const res = await cloud.signUp(email, password);
          if (!res.needsConfirmation) setIsAuthModalOpen(false);
          return res;
        }}
        onSignOut={cloud.signOut}
        onSyncNow={cloud.syncNow}
        onToast={showToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        tasks={tasks}
        onImportTasks={handleImportTasks}
        onShowToast={showToast}
      />
    </div>
  );
}

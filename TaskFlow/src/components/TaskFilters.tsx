/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, ArrowUpDown, Filter, Trash2 } from 'lucide-react';
import { FilterStatus, Priority, SortOption } from '../types/task';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  filterPriority: string; // 'all' | Priority
  onFilterPriorityChange: (priority: string) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  completedCount: number;
  onClearCompletedClick: () => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
  sortOption,
  onSortOptionChange,
  completedCount,
  onClearCompletedClick,
  activeFiltersCount,
  onResetFilters,
}) => {
  return (
    <div className="mb-6 space-y-3">
      {/* Search Bar & Clear Completed row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or notes..."
            className="w-full h-10 pl-10 pr-9 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-xs"
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear Completed Action */}
        {completedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompletedClick}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 text-xs font-medium transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="Clear all completed tasks"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed ({completedCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs (Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl">
          <button
            type="button"
            onClick={() => onFilterStatusChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterStatusChange('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onFilterStatusChange('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Priority Filter and Sort Dropdowns */}
        <div className="flex items-center gap-2 text-xs">
          {/* Priority filter */}
          <div className="relative flex items-center">
            <span className="sr-only">Filter by Priority</span>
            <select
              value={filterPriority}
              onChange={(e) => onFilterPriorityChange(e.target.value)}
              className="h-8 pl-2.5 pr-7 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shadow-xs"
              aria-label="Filter tasks by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="relative flex items-center">
            <span className="sr-only">Sort Tasks</span>
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
              className="h-8 pl-2.5 pr-7 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shadow-xs"
              aria-label="Sort tasks order"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority (High to Low)</option>
            </select>
          </div>

          {/* Reset Filters button if any are active */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-8 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

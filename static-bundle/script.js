/**
 * TaskFlow — Standalone Vanilla JS Edition
 * Lightweight, accessible, and safe task management.
 */

// Storage Keys
const STORAGE_KEY = 'taskflow_tasks_v1';
const THEME_KEY = 'taskflow_theme_v1';

// State
let tasks = [];
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let currentSort = 'newest';
let searchQuery = '';
let taskPendingDeletionId = null;

// DOM Elements
const taskListEl = document.getElementById('task-list');
const taskFormEl = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');
const formErrorEl = document.getElementById('form-error');
const toggleDetailsBtn = document.getElementById('toggle-details');
const formDetailsEl = document.getElementById('form-details');

const searchInput = document.getElementById('search-input');
const priorityFilterSelect = document.getElementById('priority-filter');
const sortSelect = document.getElementById('sort-select');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

const statTotalEl = document.getElementById('stat-total');
const statActiveEl = document.getElementById('stat-active');
const statCompletedEl = document.getElementById('stat-completed');
const statOverdueEl = document.getElementById('stat-overdue');
const progressPercentEl = document.getElementById('progress-percent');
const progressBarFillEl = document.getElementById('progress-bar-fill');
const statActiveSubEl = document.getElementById('stat-active-sub');
const statDoneSubEl = document.getElementById('stat-done-sub');

const deleteModal = document.getElementById('delete-modal');
const deleteModalMsg = document.getElementById('delete-modal-msg');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

const themeToggleBtn = document.getElementById('theme-toggle');
const headerDateEl = document.getElementById('header-date');

// Initialize Date
if (headerDateEl) {
  const now = new Date();
  headerDateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Today ISO Date YYYY-MM-DD
function getTodayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Load Theme
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeToggleBtn.textContent = '🌙';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
});

// Load Tasks from LocalStorage safely
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      tasks = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      tasks = parsed.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string');
    }
  } catch (err) {
    console.error('Failed to parse tasks', err);
    tasks = [];
  }
}

// Save Tasks to LocalStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save to LocalStorage', err);
  }
}

// Check if overdue
function isOverdue(dueDate, completed) {
  if (completed || !dueDate) return false;
  return dueDate < getTodayIso();
}

// Update Statistics
function updateStatistics() {
  const total = tasks.length;
  let completed = 0;
  let overdue = 0;

  tasks.forEach(t => {
    if (t.completed) completed++;
    else if (isOverdue(t.dueDate, t.completed)) overdue++;
  });

  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  statTotalEl.textContent = total;
  statActiveEl.textContent = active;
  statCompletedEl.textContent = completed;
  statOverdueEl.textContent = overdue;

  progressPercentEl.textContent = `${rate}%`;
  progressBarFillEl.style.width = `${rate}%`;
  statActiveSubEl.textContent = `${active} remaining`;
  statDoneSubEl.textContent = `${completed} done`;

  if (completed > 0) {
    clearCompletedBtn.classList.remove('hidden');
    clearCompletedBtn.textContent = `Clear Completed (${completed})`;
  } else {
    clearCompletedBtn.classList.add('hidden');
  }
}

// Render Tasks with Safe DOM construction (No innerHTML for user strings)
function renderTasks() {
  taskListEl.innerHTML = '';

  let filtered = [...tasks];

  // 1. Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // 2. Status filter
  if (currentFilter === 'active') {
    filtered = filtered.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = filtered.filter(t => t.completed);
  }

  // 3. Priority filter
  if (currentPriorityFilter !== 'all') {
    filtered = filtered.filter(t => t.priority === currentPriorityFilter);
  }

  // 4. Sort
  filtered.sort((a, b) => {
    if (currentSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (currentSort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (currentSort === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (currentSort === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 };
      return (weights[b.priority] || 2) - (weights[a.priority] || 2);
    }
    return 0;
  });

  // Empty state
  if (filtered.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = tasks.length === 0
      ? 'No tasks yet. Start organizing by adding your first task above.'
      : 'No tasks match your search or filter criteria.';
    taskListEl.appendChild(emptyDiv);
    return;
  }

  // Render items
  filtered.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Complete ${task.title}`);
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    // Body
    const body = document.createElement('div');
    body.className = 'task-body';

    const titleEl = document.createElement('div');
    titleEl.className = 'task-text';
    titleEl.textContent = task.title; // Safe textContent (prevents XSS)
    body.appendChild(titleEl);

    if (task.description) {
      const descEl = document.createElement('div');
      descEl.className = 'task-desc';
      descEl.textContent = task.description; // Safe textContent
      body.appendChild(descEl);
    }

    // Meta
    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge badge-${task.priority}`;
    priorityBadge.textContent = `${task.priority.toUpperCase()}`;
    meta.appendChild(priorityBadge);

    if (task.dueDate) {
      const dueSpan = document.createElement('span');
      const overdue = isOverdue(task.dueDate, task.completed);
      dueSpan.className = overdue ? 'text-danger' : '';
      dueSpan.textContent = overdue ? `Overdue (${task.dueDate})` : `Due: ${task.dueDate}`;
      meta.appendChild(dueSpan);
    }

    body.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-action';
    deleteBtn.setAttribute('aria-label', `Delete ${task.title}`);
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => confirmDelete(task.id, task.title));

    actions.appendChild(deleteBtn);

    item.appendChild(checkbox);
    item.appendChild(body);
    item.appendChild(actions);

    taskListEl.appendChild(item);
  });
}

// Add Task
function addTask(title, desc, priority, dueDate) {
  const trimmed = title.trim();
  if (!trimmed) {
    showError('Task title cannot be empty.');
    return false;
  }
  if (trimmed.length > 120) {
    showError('Task title is too long (max 120 chars).');
    return false;
  }

  const now = new Date().toISOString();
  const newTask = {
    id: 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: trimmed,
    description: desc.trim() || undefined,
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    dueDate: dueDate || undefined,
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  tasks.unshift(newTask);
  saveTasks();
  updateStatistics();
  renderTasks();
  return true;
}

// Toggle Task
function toggleTaskCompletion(id) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      return { ...t, completed: !t.completed, updatedAt: new Date().toISOString() };
    }
    return t;
  });
  saveTasks();
  updateStatistics();
  renderTasks();
}

// Delete Task Flow
function confirmDelete(id, title) {
  taskPendingDeletionId = id;
  deleteModalMsg.textContent = `Are you sure you want to delete "${title}"?`;
  deleteModal.classList.remove('hidden');
}

cancelDeleteBtn.addEventListener('click', () => {
  taskPendingDeletionId = null;
  deleteModal.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', () => {
  if (taskPendingDeletionId) {
    tasks = tasks.filter(t => t.id !== taskPendingDeletionId);
    saveTasks();
    updateStatistics();
    renderTasks();
  }
  taskPendingDeletionId = null;
  deleteModal.classList.add('hidden');
});

// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
  if (confirm('Clear all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    updateStatistics();
    renderTasks();
  }
});

// Error handling helper
function showError(msg) {
  formErrorEl.textContent = msg;
  formErrorEl.classList.remove('hidden');
}

function clearError() {
  formErrorEl.textContent = '';
  formErrorEl.classList.add('hidden');
}

// Form Submission
taskFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const success = addTask(
    taskTitleInput.value,
    taskDescInput.value,
    taskPriorityInput.value,
    taskDueDateInput.value
  );

  if (success) {
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskPriorityInput.value = 'medium';
    taskDueDateInput.value = '';
    taskTitleInput.focus();
  }
});

// Details Toggle
toggleDetailsBtn.addEventListener('click', () => {
  const isHidden = formDetailsEl.classList.toggle('hidden');
  toggleDetailsBtn.textContent = isHidden
    ? '▸ Add priority, due date, or notes'
    : '▾ Hide additional details';
});

// Search
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

// Priority Filter
priorityFilterSelect.addEventListener('change', (e) => {
  currentPriorityFilter = e.target.value;
  renderTasks();
});

// Sort
sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderTasks();
});

// Segmented Filter Tabs
document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.status;
    renderTasks();
  });
});

// Stat cards click filter
document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
  card.addEventListener('click', () => {
    const f = card.dataset.filter;
    document.querySelectorAll('.seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.status === f);
    });
    currentFilter = f;
    renderTasks();
  });
});

// Initial load
initTheme();
loadTasks();
updateStatistics();
renderTasks();

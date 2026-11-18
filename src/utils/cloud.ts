/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cloud layer (Supabase). Everything here is optional: when the two VITE_SUPABASE_*
 * variables are missing, `supabase` is null and TaskFlow behaves as a local-only app.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Task } from '../types/task';
import { validateTaskItem, type Tombstones } from './storage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR-PROJECT')
);

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/** Shape of a row in public.tasks (see supabase/schema.sql). */
export interface TaskRow {
  user_id: string;
  id: string;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function ts(value: string | undefined | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const n = Date.parse(value);
  return Number.isNaN(n) ? 0 : n;
}

function rowToTask(row: TaskRow): Task | null {
  return validateTaskItem({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function taskToRow(userId: string, task: Task): TaskRow {
  return {
    user_id: userId,
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    completed: task.completed,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted: false,
  };
}

function tombstoneRow(userId: string, id: string, deletedAt: string, task?: Task): TaskRow {
  return {
    user_id: userId,
    id,
    title: task?.title ?? '',
    description: null,
    priority: task?.priority ?? 'medium',
    due_date: null,
    completed: task?.completed ?? false,
    created_at: task?.createdAt ?? deletedAt,
    updated_at: deletedAt,
    deleted: true,
  };
}

export interface MergeResult {
  tasks: Task[];
  tombstones: Tombstones;
  rowsToPush: TaskRow[];
  /** true when the merged task list differs from what was on this device. */
  changedLocal: boolean;
}

/**
 * Pure three-way merge (local tasks + local deletions + remote rows).
 * Rule: the most recent event per task wins (last-write-wins); on an exact tie a
 * deletion wins. Safe to run repeatedly — running it twice gives the same result.
 */
export function mergeState(
  userId: string,
  localTasks: Task[],
  localTombstones: Tombstones,
  remoteRows: TaskRow[],
  now: number = Date.now()
): MergeResult {
  const localById = new Map(localTasks.map((t) => [t.id, t] as const));
  const remoteById = new Map(remoteRows.map((r) => [r.id, r] as const));
  const ids = new Set<string>([
    ...localById.keys(),
    ...Object.keys(localTombstones),
    ...remoteById.keys(),
  ]);

  const tasks: Task[] = [];
  const tombstones: Tombstones = {};
  const rowsToPush: TaskRow[] = [];
  let changedLocal = false;

  for (const id of ids) {
    const L = localById.get(id);
    const T = localTombstones[id];
    const R = remoteById.get(id);

    // Best local state: dead if the deletion is newer than the last edit.
    let local: { dead: boolean; at: number } | null = null;
    if (L && T) local = ts(T) >= ts(L.updatedAt) ? { dead: true, at: ts(T) } : { dead: false, at: ts(L.updatedAt) };
    else if (L) local = { dead: false, at: ts(L.updatedAt) };
    else if (T) local = { dead: true, at: ts(T) };

    const remote = R ? { dead: R.deleted, at: ts(R.updated_at) } : null;

    let winner: 'local' | 'remote' | 'same';
    if (local && !remote) winner = 'local';
    else if (!local && remote) winner = 'remote';
    else if (local && remote) {
      if (local.at > remote.at) winner = 'local';
      else if (remote.at > local.at) winner = 'remote';
      else if (local.dead !== remote.dead) winner = local.dead ? 'local' : 'remote';
      else winner = 'same';
    } else continue;

    if (winner === 'remote' && R) {
      if (R.deleted) {
        tombstones[id] = R.updated_at;
        if (L) changedLocal = true;
      } else {
        const task = rowToTask(R);
        if (task) {
          tasks.push(task);
          const prev = L;
          if (!prev || prev.updatedAt !== task.updatedAt) changedLocal = true;
        }
      }
      continue;
    }

    // local wins or both equal
    if (local && local.dead) {
      const deletedAt = T as string;
      tombstones[id] = deletedAt;
      if (L) changedLocal = true; // stale alive copy removed
      if (winner === 'local') rowsToPush.push(tombstoneRow(userId, id, deletedAt, L));
    } else if (L) {
      tasks.push(L);
      if (winner === 'local') rowsToPush.push(taskToRow(userId, L));
    }
  }

  // Forget very old deletions that do not need to be pushed (remote keeps its own copy).
  const pushIds = new Set(rowsToPush.map((r) => r.id));
  for (const [id, when] of Object.entries(tombstones)) {
    if (!pushIds.has(id) && now - ts(when) > TOMBSTONE_TTL_MS) delete tombstones[id];
  }

  return { tasks, tombstones, rowsToPush, changedLocal };
}

const PAGE = 1000;

export async function fetchRemoteRows(userId: string): Promise<TaskRow[]> {
  if (!supabase) return [];
  const all: TaskRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as TaskRow[];
    all.push(...rows);
    if (rows.length < PAGE) break;
  }
  return all;
}

export async function pushRows(rows: TaskRow[]): Promise<void> {
  if (!supabase || rows.length === 0) return;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from('tasks').upsert(chunk, { onConflict: 'user_id,id' });
    if (error) throw error;
  }
}

/** Calls `onChange` whenever another device changes this user's tasks. Returns an unsubscribe function. */
export function subscribeToRemoteChanges(userId: string, onChange: () => void): () => void {
  if (!supabase) return () => undefined;
  const channel = supabase
    .channel(`tasks-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function friendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Something went wrong.';
  if (/invalid login credentials/i.test(msg)) return 'Email or password is incorrect.';
  if (/already registered|already been registered/i.test(msg)) return 'This email already has an account. Try signing in.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first (check your inbox), then sign in.';
  if (/password.*(at least|short)/i.test(msg)) return 'Password is too short (use at least 6 characters).';
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.';
  if (/failed to fetch|network/i.test(msg)) return 'No internet connection. Please try again when you are online.';
  return msg;
}

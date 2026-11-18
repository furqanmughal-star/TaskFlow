/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Task } from '../types/task';
import {
  fetchRemoteRows,
  isCloudConfigured,
  mergeState,
  pushRows,
  subscribeToRemoteChanges,
  supabase,
} from './cloud';
import {
  clearLocalTaskData,
  loadOwner,
  loadTombstones,
  saveOwner,
  saveTombstones,
} from './storage';

export type CloudStatus = 'unconfigured' | 'signed-out' | 'idle' | 'syncing' | 'offline' | 'error';

export interface CloudUser {
  id: string;
  email: string;
}

interface UseCloudOptions {
  /** Returns the current in-memory task list (source of truth for merging). */
  getTasks: () => Task[];
  /** Called with the merged list when the cloud changed something locally. */
  onTasksMerged: (tasks: Task[]) => void;
}

const toCloudUser = (session: Session | null): CloudUser | null =>
  session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null;

export function useCloud({ getTasks, onTasksMerged }: UseCloudOptions) {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [status, setStatus] = useState<CloudStatus>(isCloudConfigured ? 'signed-out' : 'unconfigured');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const inFlight = useRef(false);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optsRef = useRef<UseCloudOptions>({ getTasks, onTasksMerged });
  optsRef.current = { getTasks, onTasksMerged };

  const applySession = useCallback((session: Session | null) => {
    const next = toCloudUser(session);
    userIdRef.current = next?.id ?? null;
    setUser((prev) => (prev?.id === next?.id && prev?.email === next?.email ? prev : next));
  }, []);

  // Track the Supabase auth session.
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) applySession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: awaiting Supabase calls inside this callback can deadlock the client.
      setTimeout(() => active && applySession(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const runSync = useCallback(async (): Promise<boolean> => {
    const uid = userIdRef.current;
    if (!supabase || !uid) return false;
    if (inFlight.current) {
      dirty.current = true;
      return false;
    }
    inFlight.current = true;
    let ok = false;
    try {
      do {
        dirty.current = false;
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          setStatus('offline');
          ok = false;
          break;
        }
        setStatus('syncing');
        const remote = await fetchRemoteRows(uid);
        if (userIdRef.current !== uid) return false; // signed out / switched account meanwhile
        // Read local state *after* the network wait so edits made meanwhile are never lost.
        const merged = mergeState(uid, optsRef.current.getTasks(), loadTombstones(), remote);
        saveTombstones(merged.tombstones);
        if (merged.changedLocal) optsRef.current.onTasksMerged(merged.tasks);
        await pushRows(merged.rowsToPush);
        setLastSyncedAt(new Date());
        setErrorMessage(null);
        setStatus('idle');
        ok = true;
      } while (dirty.current);
    } catch (err) {
      console.error('TaskFlow: sync failed', err);
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      setStatus(offline ? 'offline' : 'error');
      setErrorMessage(offline ? null : err instanceof Error ? err.message : 'Sync failed.');
      ok = false;
    } finally {
      inFlight.current = false;
    }
    return ok;
  }, []);

  const requestSync = useCallback(() => {
    if (!userIdRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void runSync(), 350);
  }, [runSync]);

  // When an account becomes active: bind this device to it, sync, and listen for changes.
  useEffect(() => {
    if (!user) {
      if (isCloudConfigured) setStatus('signed-out');
      return;
    }
    const owner = loadOwner();
    if (owner && owner !== user.id) {
      // Data on this device belongs to a different account — never mix accounts.
      clearLocalTaskData();
      optsRef.current.onTasksMerged([]);
    }
    saveOwner(user.id);
    void runSync();

    const unsubscribe = subscribeToRemoteChanges(user.id, requestSync);
    const onOnline = () => requestSync();
    const onVisible = () => {
      if (document.visibilityState === 'visible') requestSync();
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      unsubscribe();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.id, runSync, requestSync]); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Cloud sync is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Cloud sync is not configured.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }, []);

  /** Signs out. Tasks are removed from this device only if they were safely uploaded first. */
  const signOut = useCallback(async (): Promise<{ clearedLocal: boolean }> => {
    if (!supabase) return { clearedLocal: false };
    let synced = false;
    try {
      synced = await runSync();
    } catch {
      synced = false;
    }
    if (synced) {
      clearLocalTaskData();
      optsRef.current.onTasksMerged([]);
    }
    await supabase.auth.signOut();
    return { clearedLocal: synced };
  }, [runSync]);

  return {
    configured: isCloudConfigured,
    user,
    status,
    lastSyncedAt,
    errorMessage,
    signIn,
    signUp,
    signOut,
    requestSync,
    syncNow: runSync,
  };
}

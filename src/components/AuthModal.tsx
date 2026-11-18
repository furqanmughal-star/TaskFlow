/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, LogOut, Mail, Lock, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import type { CloudStatus, CloudUser } from '../utils/useCloud';
import { friendlyAuthError } from '../utils/cloud';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  configured: boolean;
  user: CloudUser | null;
  status: CloudStatus;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  onSignOut: () => Promise<{ clearedLocal: boolean }>;
  onSyncNow: () => Promise<boolean>;
  onToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  configured,
  user,
  status,
  lastSyncedAt,
  errorMessage,
  onSignIn,
  onSignUp,
  onSignOut,
  onSyncNow,
  onToast,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setNotice(null);
      setPassword('');
    }
  }, [isOpen, mode]);

  // Close automatically once the person has signed in.
  useEffect(() => {
    if (isOpen && user && busy) setBusy(false);
  }, [isOpen, user, busy]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        await onSignIn(cleanEmail, password);
        onToast('Signed in. Syncing your tasks…', 'success');
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        const { needsConfirmation } = await onSignUp(cleanEmail, password);
        if (needsConfirmation) {
          setNotice('Account created. Check your email and click the confirmation link, then sign in.');
          setMode('signin');
        } else {
          onToast('Account created. Your tasks will now sync.', 'success');
        }
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      const { clearedLocal } = await onSignOut();
      onToast(
        clearedLocal
          ? 'Signed out. Your tasks are safe in your cloud account.'
          : 'Signed out. Some changes could not be uploaded and stay on this device.',
        clearedLocal ? 'info' : 'warning'
      );
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const statusText: Record<CloudStatus, string> = {
    unconfigured: 'Not configured',
    'signed-out': 'Signed out',
    idle: 'Up to date',
    syncing: 'Syncing…',
    offline: 'Offline — will sync when you are back online',
    error: 'Sync problem',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              {configured ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
                {user ? 'Your cloud account' : 'Sync across devices'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user ? statusText[status] : 'Sign in to keep tasks on your phone and laptop in sync.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!configured && (
          <div className="mt-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
            Cloud sync is not set up in this build. TaskFlow still works fully offline — your tasks are stored on
            this device. To enable sync, add your Supabase keys (see SETUP_GUIDE.md) and rebuild.
          </div>
        )}

        {configured && user && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400">Signed in as</div>
              <div className="font-medium text-slate-900 dark:text-white break-all">{user.email}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {lastSyncedAt ? `Last synced ${lastSyncedAt.toLocaleTimeString()}` : 'Not synced yet'}
              </div>
              {status === 'error' && errorMessage && (
                <div role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void onSyncNow()}
                disabled={status === 'syncing' || busy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                Sync now
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {configured && !user && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                    mode === m
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <label className="block relative">
              <span className="sr-only">Email</span>
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                autoFocus
              />
            </label>
            <label className="block relative">
              <span className="sr-only">Password</span>
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 6 characters)"
                className={inputClass}
              />
            </label>

            {error && (
              <div role="alert" className="text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {notice && <div className="text-xs text-emerald-700 dark:text-emerald-400">{notice}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Tasks already on this device will be uploaded to your account. You can keep using TaskFlow without an
              account — it works offline too.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

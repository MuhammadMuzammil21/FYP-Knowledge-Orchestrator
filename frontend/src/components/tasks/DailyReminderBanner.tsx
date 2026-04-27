'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task.types';

interface DailyReminderBannerProps {
  tasks: Task[];
}

const TODAY = new Date().toISOString().split('T')[0]; // "2026-05-01"
const SESSION_KEY = `tasks-banner-dismissed-${TODAY}`;

function truncate(str: string, max = 24) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function DailyReminderBanner({ tasks }: DailyReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) setVisible(true);
    }
  }, []);

  const dueToday = tasks.filter((t) => t.due_date === TODAY);
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < TODAY && t.status !== 'completed'
  );

  if (dueToday.length === 0 && overdue.length === 0) return null;
  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        visible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="relative mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20 pl-4 pr-10 py-3 border-l-4 border-l-amber-500">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss reminder"
          className="absolute top-2.5 right-2.5 rounded-md p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Due today */}
        {dueToday.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 flex-shrink-0">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {dueToday.length} task{dueToday.length > 1 ? 's' : ''} due today
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dueToday.slice(0, 5).map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                >
                  {truncate(t.description)}
                </span>
              ))}
              {dueToday.length > 5 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 self-center">
                  +{dueToday.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-destructive flex-shrink-0">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {overdue.length} overdue task{overdue.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {overdue.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive border border-destructive/20"
                >
                  {truncate(t.description)}
                </span>
              ))}
              {overdue.length > 3 && (
                <span className="text-xs text-destructive/70 self-center">
                  +{overdue.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

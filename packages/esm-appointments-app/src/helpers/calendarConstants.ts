/**
 * calendarConstants.ts
 * Shared visual constants for status colours and service colours.
 * Kept separate so components can import only what they need.
 */

import { type StatusStyle } from '../types/calendar.types';

export const STATUS_COLORS: Record<string, StatusStyle> = {
  Scheduled: { bg: '#e8f4f8', text: '#0077a8', dot: '#0ea5e9' },
  CheckedIn: { bg: '#e6f4ea', text: '#1a6e35', dot: '#22c55e' },
  Completed: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  Missed: { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  Cancelled: { bg: '#fdf4ff', text: '#7e22ce', dot: '#a855f7' },
};

export const SERVICE_COLORS: Record<string, string> = {
  'General Medicine': '#0ea5e9',
  'Outpatient Dept': '#8b5cf6',
  Dental: '#f59e0b',
  Ophthalmology: '#10b981',
  default: '#64748b',
};

/** Hours shown in weekly and daily timeline views (24-hour, inclusive). */
export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = 18; // exclusive – shows 7:00 … 17:xx

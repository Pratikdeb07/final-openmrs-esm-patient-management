/**
 * calendar-date-helpers.ts
 * Utility functions for converting between calendar systems and ISO dates.
 */

import { CALENDAR_SYSTEMS, type CalendarDate } from './calendar-systems';

/** Convert a calendar date to an ISO string (YYYY-MM-DD) via Gregorian */
export function calendarDateToISO(calKey: string, year: number, month: number, day: number): string {
  const g = CALENDAR_SYSTEMS[calKey].toGregorian(year, month, day);
  return `${g.year}-${String(g.month + 1).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
}

/** Convert an ISO date string to a calendar date */
export function isoToCalendarDate(calKey: string, iso: string): CalendarDate {
  const [y, m, d] = iso.split('-').map(Number);
  return CALENDAR_SYSTEMS[calKey].fromGregorian(y, m - 1, d);
}

/** Today's date as YYYY-MM-DD in local time */
export function getTodayISO(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export interface WeekDay extends CalendarDate {
  iso: string;
  /** Gregorian day-of-week 0=Sun */
  dow: number;
}

/** Returns the 7 days for the week containing the given calendar date */
export function getWeekDays(calKey: string, year: number, month: number, day: number): WeekDay[] {
  const cs = CALENDAR_SYSTEMS[calKey];
  const g = cs.toGregorian(year, month, day);
  const pivot = new Date(g.year, g.month, g.day);
  const offset = (pivot.getDay() - cs.firstDayOfWeek + 7) % 7;
  const start = new Date(g.year, g.month, g.day - offset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const cal = cs.fromGregorian(d.getFullYear(), d.getMonth(), d.getDate());
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { ...cal, iso, dow: d.getDay() };
  });
}

/** Returns ordered day-of-week labels for the calendar's firstDayOfWeek */
export function getOrderedDowLabels(calKey: string): string[] {
  const cs = CALENDAR_SYSTEMS[calKey];
  return [...cs.daysOfWeek.slice(cs.firstDayOfWeek), ...cs.daysOfWeek.slice(0, cs.firstDayOfWeek)];
}

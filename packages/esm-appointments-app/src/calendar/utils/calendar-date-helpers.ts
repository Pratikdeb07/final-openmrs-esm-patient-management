/**
 * calendar-date-helpers.ts
 * Utility functions for converting between calendar systems and ISO dates.
 *
 * Uses @internationalized/date for core date operations (parsing, formatting, week queries)
 * and our CALENDAR_SYSTEMS registry for calendar-to-calendar conversions.
 */

import { parseDate, today, getLocalTimeZone, startOfWeek, getDayOfWeek } from '@internationalized/date';
import { CALENDAR_SYSTEMS, type CalendarDate } from './calendar-systems';

// ── ISO conversion ───────────────────────────────────────────────────────────

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

// ── Today ────────────────────────────────────────────────────────────────────

/** Today's date as YYYY-MM-DD in local timezone */
export function getTodayISO(): string {
  return today(getLocalTimeZone()).toString();
}

// ── Week types and helpers ───────────────────────────────────────────────────

export interface WeekDay extends CalendarDate {
  iso: string;
  /** Gregorian day-of-week 0=Sun */
  dow: number;
}

/** Map our numeric firstDayOfWeek (0=Sun) to the abbreviated string @internationalized/date expects */
const DOW_ABBREVIATIONS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * Returns the 7 days for the week containing the given calendar date.
 * Uses @internationalized/date's startOfWeek which correctly handles locale-specific week starts,
 * and supports an optional firstDayOfWeek override for calendars like Persian (Saturday start).
 */
export function getWeekDays(calKey: string, year: number, month: number, day: number): WeekDay[] {
  const cs = CALENDAR_SYSTEMS[calKey];
  const g = cs.toGregorian(year, month, day);
  const gregDate = parseDate(`${g.year}-${String(g.month + 1).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`);

  // Use startOfWeek with the calendar's firstDayOfWeek to correctly find week boundaries
  const weekStart = startOfWeek(gregDate, 'en-US', DOW_ABBREVIATIONS[cs.firstDayOfWeek]);

  return Array.from({ length: 7 }, (_, i) => {
    const d = weekStart.add({ days: i });
    // Convert each day back to the target calendar
    const cal = cs.fromGregorian(d.year, d.month - 1, d.day);
    return {
      ...cal,
      iso: d.toString(),
      dow: getDayOfWeek(d, 'en-US', 'sun'), // Always 0=Sun for column header matching
    };
  });
}

/**
 * Returns ordered day-of-week labels for the calendar's firstDayOfWeek.
 * Rotates the day-of-week array so the first element matches the calendar's week start.
 */
export function getOrderedDowLabels(calKey: string): string[] {
  const cs = CALENDAR_SYSTEMS[calKey];
  return [...cs.daysOfWeek.slice(cs.firstDayOfWeek), ...cs.daysOfWeek.slice(0, cs.firstDayOfWeek)];
}

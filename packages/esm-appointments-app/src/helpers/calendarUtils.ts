/**
 * calendarUtils.ts
 * Pure utility functions for calendar calculations and date conversions.
 * No React dependencies – safe to use in hooks, helpers, and components.
 */

import { type CalendarCell, type CalendarSystemKey, type WeekDay } from '../types/calendar.types';
import { CALENDAR_SYSTEMS } from './calendarSystems';

// ─── Date helpers ─────────────────────────────────────────────────────────

/** Returns today as an ISO string (YYYY-MM-DD) in local time. */
export function getLocalTodayISO(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Converts a calendar date in the given system to an ISO string. */
export function calendarDateToISO(calSys: CalendarSystemKey, year: number, month: number, day: number): string {
  const g = CALENDAR_SYSTEMS[calSys].toGregorian(year, month, day);
  const gy = g.year;
  const gm = String(g.month + 1).padStart(2, '0');
  const gd = String(g.day).padStart(2, '0');
  return `${gy}-${gm}-${gd}`;
}

/** Converts an ISO date string to a calendar date in the given system. */
export function isoToCalendarDate(
  calSys: CalendarSystemKey,
  isoDate: string,
): { year: number; month: number; day: number } {
  const [gy, gm, gd] = isoDate.split('-').map(Number);
  return CALENDAR_SYSTEMS[calSys].fromGregorian(gy, gm - 1, gd);
}

// ─── Monthly grid ─────────────────────────────────────────────────────────

/**
 * Returns a flat array of CalendarCell objects for the monthly grid.
 * Leading/trailing cells have inMonth=false and day=null.
 * The grid always has a row count that is a multiple of 7.
 */
export function getCalendarDays(calSys: CalendarSystemKey, year: number, month: number): CalendarCell[] {
  const cs = CALENDAR_SYSTEMS[calSys];
  const daysInMonth = cs.getDaysInMonth(year, month);
  const firstDow = cs.getFirstDayOfMonth(year, month);
  const offset = (firstDow - cs.firstDayOfWeek + 7) % 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ day: null, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ day: null, inMonth: false });
  return cells;
}

// ─── Weekly strip ─────────────────────────────────────────────────────────

/**
 * Returns the 7 WeekDay objects for the week that contains the given calendar date.
 * The week starts on the firstDayOfWeek defined by the calendar system.
 */
export function getWeekDays(calSys: CalendarSystemKey, year: number, month: number, day: number): WeekDay[] {
  const cs = CALENDAR_SYSTEMS[calSys];
  const g = cs.toGregorian(year, month, day);
  const pivot = new Date(g.year, g.month, g.day);
  const dow = pivot.getDay();
  const weekStartOffset = (dow - cs.firstDayOfWeek + 7) % 7;
  const weekStart = new Date(g.year, g.month, g.day - weekStartOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const cal = cs.fromGregorian(d.getFullYear(), d.getMonth(), d.getDate());
    const gy = d.getFullYear();
    const gm = String(d.getMonth() + 1).padStart(2, '0');
    const gd = String(d.getDate()).padStart(2, '0');
    const iso = `${gy}-${gm}-${gd}`;
    return { ...cal, iso, dow: d.getDay() };
  });
}

// ─── Navigation helpers ───────────────────────────────────────────────────

/** Clamps a day value to the number of days in the target month. */
export function clampDay(calSys: CalendarSystemKey, year: number, month: number, day: number): number {
  const max = CALENDAR_SYSTEMS[calSys].getDaysInMonth(year, month);
  return Math.min(day, max);
}

/**
 * Shifts an ISO date by a given number of days and returns the result
 * as a calendar date in the specified system.
 */
export function shiftISOByDays(
  calSys: CalendarSystemKey,
  year: number,
  month: number,
  day: number,
  deltaDays: number,
): { year: number; month: number; day: number } {
  const cs = CALENDAR_SYSTEMS[calSys];
  const g = cs.toGregorian(year, month, day);
  const d = new Date(g.year, g.month, g.day + deltaDays);
  return cs.fromGregorian(d.getFullYear(), d.getMonth(), d.getDate());
}

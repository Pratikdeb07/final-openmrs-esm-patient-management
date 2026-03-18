/**
 * calendar.types.ts
 * Types for calendar system support, view modes, and appointment display.
 */

export type CalendarSystemKey = 'gregory' | 'ethiopic' | 'islamic' | 'persian';

export type ViewMode = 'monthly' | 'weekly' | 'daily';

export interface CalendarDate {
  year: number;
  /** 0-based month index */
  month: number;
  day: number;
}

export interface CalendarSystem {
  name: string;
  label: string;
  months: string[];
  daysOfWeek: string[];
  /** Index of the first day of the week (0=Sun, 6=Sat) */
  firstDayOfWeek: number;
  getDaysInMonth: (year: number, month: number) => number;
  getFirstDayOfMonth: (year: number, month: number) => number;
  /** Convert a calendar date to Gregorian {year, month(0-based), day} */
  toGregorian: (year: number, month: number, day: number) => CalendarDate;
  /** Convert a Gregorian date (0-based month) to this calendar system */
  fromGregorian: (year: number, month: number, day: number) => CalendarDate;
}

export interface WeekDay extends CalendarDate {
  /** ISO date string YYYY-MM-DD */
  iso: string;
  /** getDay() value (0=Sun … 6=Sat) */
  dow: number;
}

export interface CalendarCell {
  day: number | null;
  inMonth: boolean;
}

// ─── Appointment domain ───────────────────────────────────────────────────

export type AppointmentStatus = 'Scheduled' | 'CheckedIn' | 'Completed' | 'Missed' | 'Cancelled';

export interface AppointmentItem {
  id: string;
  patientName: string;
  service: string;
  time: string;
  status: AppointmentStatus;
  /** ISO date string YYYY-MM-DD */
  date: string;
}

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

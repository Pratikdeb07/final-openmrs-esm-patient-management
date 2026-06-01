/**
 * calendar-systems.ts
 * Calendar system definitions using @internationalized/date as the conversion engine.
 * Provides Gregorian, Ethiopic, Islamic (civil), and Persian (Solar Hijri) calendars.
 *
 * Rather than implementing custom JDN (Julian Day Number) math, we delegate to the
 * battle-tested @internationalized/date library from the Adobe React Aria team.
 * This library is already a transitive dependency via @carbon/react and @openmrs/esm-framework.
 *
 * All months are 0-based throughout our public API to match JavaScript's Date convention.
 * @internationalized/date uses 1-based months internally — the conversion happens in the adapter layer.
 */

import {
  type Calendar,
  GregorianCalendar,
  EthiopicCalendar,
  IslamicCivilCalendar,
  PersianCalendar,
  CalendarDate as InternationalCalendarDate,
  toCalendar,
  getDayOfWeek,
} from '@internationalized/date';

// ── Public types ─────────────────────────────────────────────────────────────

export interface CalendarDate {
  year: number;
  month: number; // 0-based
  day: number;
}

export interface CalendarSystem {
  key: string;
  label: string;
  months: string[];
  /** Short day labels starting from Sunday (index 0) */
  daysOfWeek: string[];
  /** 0=Sun, 1=Mon, 6=Sat — first column of the week grid */
  firstDayOfWeek: number;
  monthsInYear: number;
  getDaysInMonth(year: number, month: number): number;
  /** Returns Gregorian day-of-week (0=Sun) for day 1 of the month */
  getFirstDayOfMonth(year: number, month: number): number;
  toGregorian(year: number, month: number, day: number): CalendarDate;
  fromGregorian(year: number, month: number, day: number): CalendarDate;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Build a CalendarSystem adapter from an @internationalized/date Calendar implementation.
 * Translates between our 0-based month API and the library's 1-based month convention.
 */
function createCalendarSystem(
  calendar: Calendar,
  key: string,
  label: string,
  months: string[],
  daysOfWeek: string[],
  firstDayOfWeek: number,
): CalendarSystem {
  const gregCal = new GregorianCalendar();

  return {
    key,
    label,
    months,
    daysOfWeek,
    firstDayOfWeek,

    get monthsInYear() {
      // Use a representative date to query months in year
      return calendar.getMonthsInYear(new InternationalCalendarDate(calendar, 1, 1, 1));
    },

    getDaysInMonth(year: number, month: number): number {
      const date = new InternationalCalendarDate(calendar, year, month + 1, 1);
      return calendar.getDaysInMonth(date);
    },

    getFirstDayOfMonth(year: number, month: number): number {
      const date = new InternationalCalendarDate(calendar, year, month + 1, 1);
      // Convert to Gregorian to get a universally comparable day-of-week
      const gregDate = toCalendar(date, gregCal);
      // getDayOfWeek with 'sun' as firstDayOfWeek gives 0=Sunday … 6=Saturday
      return getDayOfWeek(gregDate, 'en-US', 'sun');
    },

    toGregorian(year: number, month: number, day: number): CalendarDate {
      const date = new InternationalCalendarDate(calendar, year, month + 1, day);
      const gregDate = toCalendar(date, gregCal);
      return { year: gregDate.year, month: gregDate.month - 1, day: gregDate.day };
    },

    fromGregorian(year: number, month: number, day: number): CalendarDate {
      const gregDate = new InternationalCalendarDate(gregCal, year, month + 1, day);
      const calDate = toCalendar(gregDate, calendar);
      return { year: calDate.year, month: calDate.month - 1, day: calDate.day };
    },
  };
}

// ── Calendar system registry ──────────────────────────────────────────────────

export const CALENDAR_SYSTEMS: Record<string, CalendarSystem> = {
  gregory: createCalendarSystem(
    new GregorianCalendar(),
    'gregory',
    'Gregorian',
    [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    0, // firstDayOfWeek: Sunday
  ),

  ethiopic: createCalendarSystem(
    new EthiopicCalendar(),
    'ethiopic',
    'Ethiopic',
    [
      'Meskerem',
      'Tikimt',
      'Hidar',
      'Tahesas',
      'Tir',
      'Yekatit',
      'Megabit',
      'Miazia',
      'Ginbot',
      'Sene',
      'Hamle',
      'Nehase',
      'Pagume',
    ],
    ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
    0, // firstDayOfWeek: Sunday
  ),

  islamic: createCalendarSystem(
    new IslamicCivilCalendar(),
    'islamic',
    'Islamic (Civil)',
    [
      'Muharram',
      'Safar',
      "Rabi' al-Awwal",
      "Rabi' al-Thani",
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      "Sha'ban",
      'Ramadan',
      'Shawwal',
      "Dhu al-Qi'dah",
      'Dhu al-Hijjah',
    ],
    ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    0, // firstDayOfWeek: Sunday
  ),

  persian: createCalendarSystem(
    new PersianCalendar(),
    'persian',
    'Persian (Solar Hijri)',
    [
      'Farvardin',
      'Ordibehesht',
      'Khordad',
      'Tir',
      'Mordad',
      'Shahrivar',
      'Mehr',
      'Aban',
      'Azar',
      'Dey',
      'Bahman',
      'Esfand',
    ],
    ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    6, // firstDayOfWeek: Saturday
  ),
};

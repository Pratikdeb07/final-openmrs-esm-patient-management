/**
 * calendar-systems.ts
 * JDN-based conversions for Gregorian, Ethiopic, Islamic (civil), Persian calendars.
 * All months are 0-based throughout.
 */

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

// ── JDN helpers ───────────────────────────────────────────────────────────────

function gregorianToJdn(y: number, m: number, d: number): number {
  let month = m + 1;
  let year = y;
  if (month < 3) {
    year--;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + b - 1524;
}

function jdnToGregorian(jdn: number): CalendarDate {
  const w = Math.floor((jdn - 1867216.25) / 36524.25);
  const a = jdn + 1 + w - Math.floor(w / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e - 1 <= 12 ? e - 1 : e - 13;
  const year = month <= 2 ? c - 4715 : c - 4716;
  return { year, month: month - 1, day };
}

function islamicToJdn(y: number, m: number, d: number): number {
  const mo = m + 1;
  return Math.floor((11 * y + 3) / 30) + 354 * y + 30 * mo - Math.floor((mo - 1) / 2) + d + 1948440 - 385;
}

function jdnToIslamic(jdn: number): CalendarDate {
  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { year: y, month: m - 1, day: d };
}

function ethiopicToJdn(y: number, m: number, d: number): number {
  return 1723855 + 365 * y + Math.floor(y / 4) + 30 * m + d;
}

function jdnToEthiopic(jdn: number): CalendarDate {
  const r = jdn - 1723856;
  const n = r + 365 * 3;
  const year = Math.floor(n / 1461) * 4 + Math.floor((n % 1461) / 365) - 3;
  const daysInYear = jdn - ethiopicToJdn(year, 0, 1);
  const month = Math.floor(daysInYear / 30);
  const day = daysInYear - month * 30 + 1;
  return { year, month, day };
}

function persianToJdn(y: number, m: number, d: number): number {
  const epBase = y - (y >= 0 ? 474 : 473);
  const epYear = 474 + (((epBase % 2820) + 2820) % 2820);
  const mDays = m < 6 ? m * 31 : 186 + (m - 6) * 30;
  return (
    d +
    mDays +
    Math.floor((epYear * 682 - 110) / 2816) +
    (epYear - 1) * 365 +
    Math.floor(epBase / 2820) * 1029983 +
    1948320 -
    1
  );
}

function jdnToPersian(jdn: number): CalendarDate {
  const depoch = jdn - persianToJdn(475, 0, 1);
  const cycle = Math.floor(depoch / 1029983);
  const cyear = ((depoch % 1029983) + 1029983) % 1029983;
  let ycycle =
    cyear === 1029982
      ? 2820
      : Math.floor((2134 * Math.floor(cyear / 366) + 2816 * (cyear % 366) + 2815) / 1028522) +
        Math.floor(cyear / 366) +
        1;
  let year = ycycle + 2820 * cycle + 474;
  if (year <= 0) year--;
  const yday = jdn - persianToJdn(year, 0, 1) + 1;
  const month = yday <= 186 ? Math.floor((yday - 1) / 31) : Math.floor((yday - 187) / 30) + 6;
  const day = yday <= 186 ? yday - month * 31 : yday - 186 - (month - 6) * 30;
  return { year, month, day };
}

// ── Calendar system registry ──────────────────────────────────────────────────

export const CALENDAR_SYSTEMS: Record<string, CalendarSystem> = {
  gregory: {
    key: 'gregory',
    label: 'Gregorian',
    monthsInYear: 12,
    firstDayOfWeek: 0,
    months: [
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
    daysOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    getDaysInMonth: (y, m) => new Date(y, m + 1, 0).getDate(),
    getFirstDayOfMonth: (y, m) => (gregorianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
    fromGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
  },
  ethiopic: {
    key: 'ethiopic',
    label: 'Ethiopic',
    monthsInYear: 13,
    firstDayOfWeek: 0,
    months: [
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
    daysOfWeek: ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
    getDaysInMonth: (y, m) => (m === 12 ? (y % 4 === 3 ? 6 : 5) : 30),
    getFirstDayOfMonth: (y, m) => (ethiopicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(ethiopicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToEthiopic(gregorianToJdn(y, m, d)),
  },
  islamic: {
    key: 'islamic',
    label: 'Islamic (Civil)',
    monthsInYear: 12,
    firstDayOfWeek: 0,
    months: [
      'Muharram',
      'Safar',
      'Rabi al-Awwal',
      'Rabi al-Thani',
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      "Sha'ban",
      'Ramadan',
      'Shawwal',
      "Dhu al-Qi'dah",
      'Dhu al-Hijjah',
    ],
    daysOfWeek: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    getDaysInMonth: (y, m) => {
      if (m % 2 === 0) return 30;
      if (m === 11) return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(y % 30) ? 30 : 29;
      return 29;
    },
    getFirstDayOfMonth: (y, m) => (islamicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(islamicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToIslamic(gregorianToJdn(y, m, d)),
  },
  persian: {
    key: 'persian',
    label: 'Persian (Solar Hijri)',
    monthsInYear: 12,
    firstDayOfWeek: 6,
    months: [
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
    daysOfWeek: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    getDaysInMonth: (y, m) => {
      if (m < 6) return 31;
      if (m < 11) return 30;
      return [1, 5, 9, 13, 17, 22, 26, 30].includes(y % 33) ? 30 : 29;
    },
    getFirstDayOfMonth: (y, m) => (persianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(persianToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToPersian(gregorianToJdn(y, m, d)),
  },
};

/**
 * calendarSystems.ts
 * Registry of supported calendar systems.
 * Each system exposes a uniform interface for use by view components.
 */

import { type CalendarSystem, type CalendarSystemKey } from '../types/calendar.types';
import {
  gregorianToJdn,
  jdnToGregorian,
  islamicToJdn,
  jdnToIslamic,
  ethiopicToJdn,
  jdnToEthiopic,
  persianToJdn,
  jdnToPersian,
} from './jdn';

const ISLAMIC_LEAP_YEARS = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

export const CALENDAR_SYSTEMS: Record<CalendarSystemKey, CalendarSystem> = {
  gregory: {
    name: 'Gregorian',
    label: 'Gregorian (ISO)',
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
    daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    firstDayOfWeek: 0,
    getDaysInMonth: (y, m) => new Date(y, m + 1, 0).getDate(),
    getFirstDayOfMonth: (y, m) => (gregorianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
    fromGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
  },

  ethiopic: {
    name: 'Ethiopic',
    label: 'Ethiopic',
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
    firstDayOfWeek: 0,
    getDaysInMonth: (y, m) => (m === 12 ? (y % 4 === 3 ? 6 : 5) : 30),
    getFirstDayOfMonth: (y, m) => (ethiopicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(ethiopicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToEthiopic(gregorianToJdn(y, m, d)),
  },

  islamic: {
    name: 'Islamic',
    label: 'Islamic (Civil)',
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
    firstDayOfWeek: 0,
    getDaysInMonth: (y, m) => (m % 2 === 0 ? 30 : m === 11 && ISLAMIC_LEAP_YEARS.includes(y % 30) ? 30 : 29),
    getFirstDayOfMonth: (y, m) => (islamicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(islamicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToIslamic(gregorianToJdn(y, m, d)),
  },

  persian: {
    name: 'Persian',
    label: 'Persian (Solar Hijri)',
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
    firstDayOfWeek: 6,
    getDaysInMonth: (y, m) => (m < 6 ? 31 : m < 11 ? 30 : [1, 5, 9, 13, 17, 22, 26, 30].includes(y % 33) ? 30 : 29),
    getFirstDayOfMonth: (y, m) => (persianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(persianToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToPersian(gregorianToJdn(y, m, d)),
  },
};

/**
 * jdn.ts
 * Julian Day Number (JDN) conversion algorithms.
 * These provide lossless round-trip conversions between calendar systems.
 * All month parameters are 0-based unless stated otherwise.
 */

// ─── Gregorian ────────────────────────────────────────────────────────────

export function gregorianToJdn(y: number, m: number, d: number): number {
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

export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const w = Math.floor((jdn - 1867216.25) / 36524.25);
  const x = Math.floor(w / 4);
  const a = jdn + 1 + w - x;
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const f = Math.floor(30.6001 * e);
  const day = b - d - f;
  const month = e - 1 <= 12 ? e - 1 : e - 13;
  const year = month <= 2 ? c - 4715 : c - 4716;
  return { year, month: month - 1, day };
}

// ─── Islamic (Civil) ──────────────────────────────────────────────────────

export function islamicToJdn(y: number, m: number, d: number): number {
  return Math.floor((11 * y + 3) / 30) + 354 * y + 30 * (m + 1) - Math.floor(m / 2) + d + 1948440 - 385;
}

export function jdnToIslamic(jdn: number): { year: number; month: number; day: number } {
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
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month: month - 1, day };
}

// ─── Ethiopic ─────────────────────────────────────────────────────────────

export function ethiopicToJdn(y: number, m: number, d: number): number {
  return 1723855 + 365 * y + Math.floor(y / 4) + 30 * m + d;
}

export function jdnToEthiopic(jdn: number): { year: number; month: number; day: number } {
  const r = jdn - 1723856;
  const n = r + 365 * 3;
  const year = Math.floor(n / 1461) * 4 + Math.floor((n % 1461) / 365) - 3;
  const daysInYear = jdn - ethiopicToJdn(year, 0, 1);
  const month = Math.floor(daysInYear / 30);
  const day = daysInYear - month * 30 + 1;
  return { year, month, day };
}

// ─── Persian (Solar Hijri) ────────────────────────────────────────────────

export function persianToJdn(y: number, m: number, d: number): number {
  const epBase = y - (y >= 0 ? 474 : 473);
  const epYear = 474 + (epBase % 2820);
  const mDays = m <= 6 ? m * 31 : 186 + (m - 6) * 30;
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

export function jdnToPersian(jdn: number): { year: number; month: number; day: number } {
  const depoch = jdn - persianToJdn(475, 0, 1);
  const cycle = Math.floor(depoch / 1029983);
  const cyear = depoch % 1029983;
  let ycycle: number;
  if (cyear === 1029982) {
    ycycle = 2820;
  } else {
    const aux1 = Math.floor(cyear / 366);
    const aux2 = cyear % 366;
    ycycle = Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
  }
  let year = ycycle + 2820 * cycle + 474;
  if (year <= 0) year--;
  const yday = jdn - persianToJdn(year, 0, 1) + 1;
  const month = yday <= 186 ? Math.floor((yday - 1) / 31) : Math.floor((yday - 187) / 30) + 6;
  const day = yday <= 186 ? yday - month * 31 : yday - 186 - (month - 6) * 30;
  return { year, month, day };
}

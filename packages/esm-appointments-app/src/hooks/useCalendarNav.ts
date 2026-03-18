/**
 * useCalendarNav.ts
 * Custom hook that owns all navigation state for the calendar:
 * - current calendar system
 * - current view mode (monthly / weekly / daily)
 * - the focused calendar date (year, month, day)
 *
 * It exposes helpers for prev/next navigation and calendar-system switching
 * so that the parent component stays thin.
 */

import { useState, useCallback, useMemo } from 'react';
import { type CalendarSystemKey, type ViewMode } from '../types/calendar.types';
import { CALENDAR_SYSTEMS } from '../helpers/calendarSystems';
import { getWeekDays, clampDay, shiftISOByDays } from '../helpers/calendarUtils';

interface CalendarNavState {
  calSys: CalendarSystemKey;
  viewMode: ViewMode;
  navYear: number;
  navMonth: number;
  navDay: number;
}

interface CalendarNavActions {
  setCalSys: (sys: CalendarSystemKey) => void;
  setViewMode: (mode: ViewMode) => void;
  handlePrev: () => void;
  handleNext: () => void;
  /** Jump to an ISO date and optionally change the view mode. */
  jumpToISO: (iso: string, mode?: ViewMode) => void;
  titleLabel: string;
}

/** Initialise the navigation to today (Gregorian) converted to the initial calendar system. */
function initState(): Pick<CalendarNavState, 'navYear' | 'navMonth' | 'navDay'> {
  const now = new Date();
  const initial = CALENDAR_SYSTEMS.gregory.fromGregorian(now.getFullYear(), now.getMonth(), now.getDate());
  return { navYear: initial.year, navMonth: initial.month, navDay: initial.day };
}

export function useCalendarNav(): CalendarNavState & CalendarNavActions {
  const [calSys, setCalSysRaw] = useState<CalendarSystemKey>('gregory');
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [{ navYear, navMonth, navDay }, setNav] = useState(initState);

  const cs = CALENDAR_SYSTEMS[calSys];

  // ── Calendar system switch: preserve the same Gregorian instant ──────────
  const setCalSys = useCallback(
    (newSys: CalendarSystemKey) => {
      const g = CALENDAR_SYSTEMS[calSys].toGregorian(navYear, navMonth, navDay);
      const converted = CALENDAR_SYSTEMS[newSys].fromGregorian(g.year, g.month, g.day);
      setNav({ navYear: converted.year, navMonth: converted.month, navDay: converted.day });
      setCalSysRaw(newSys);
    },
    [calSys, navYear, navMonth, navDay],
  );

  // ── Previous ──────────────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') {
      const isFirst = navMonth === 0;
      const newMonth = isFirst ? cs.months.length - 1 : navMonth - 1;
      const newYear = isFirst ? navYear - 1 : navYear;
      setNav({
        navYear: newYear,
        navMonth: newMonth,
        navDay: clampDay(calSys, newYear, newMonth, navDay),
      });
    } else {
      const delta = viewMode === 'weekly' ? -7 : -1;
      const conv = shiftISOByDays(calSys, navYear, navMonth, navDay, delta);
      setNav({ navYear: conv.year, navMonth: conv.month, navDay: conv.day });
    }
  }, [viewMode, navYear, navMonth, navDay, calSys, cs]);

  // ── Next ──────────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') {
      const isLast = navMonth === cs.months.length - 1;
      const newMonth = isLast ? 0 : navMonth + 1;
      const newYear = isLast ? navYear + 1 : navYear;
      setNav({
        navYear: newYear,
        navMonth: newMonth,
        navDay: clampDay(calSys, newYear, newMonth, navDay),
      });
    } else {
      const delta = viewMode === 'weekly' ? 7 : 1;
      const conv = shiftISOByDays(calSys, navYear, navMonth, navDay, delta);
      setNav({ navYear: conv.year, navMonth: conv.month, navDay: conv.day });
    }
  }, [viewMode, navYear, navMonth, navDay, calSys, cs]);

  // ── Jump to an ISO date (used by modal drill-down) ────────────────────────
  const jumpToISO = useCallback(
    (iso: string, mode?: ViewMode) => {
      const [gy, gm, gd] = iso.split('-').map(Number);
      const conv = CALENDAR_SYSTEMS[calSys].fromGregorian(gy, gm - 1, gd);
      setNav({ navYear: conv.year, navMonth: conv.month, navDay: conv.day });
      if (mode) setViewMode(mode);
    },
    [calSys],
  );

  // ── Title label ──────────────────────────────────────────────────────────
  const titleLabel = useMemo(() => {
    const monthName = cs.months[navMonth] ?? `Month ${navMonth + 1}`;
    if (viewMode === 'monthly') return `${monthName} ${navYear}`;
    if (viewMode === 'weekly') {
      const week = getWeekDays(calSys, navYear, navMonth, navDay);
      const first = week[0];
      const last = week[6];
      const fm = cs.months[first.month] ?? `M${first.month + 1}`;
      const lm = cs.months[last.month] ?? `M${last.month + 1}`;
      if (first.month === last.month && first.year === last.year) {
        return `${fm} ${first.day}–${last.day}, ${first.year}`;
      }
      return `${fm} ${first.day} – ${lm} ${last.day}, ${last.year}`;
    }
    return `${monthName} ${navDay}, ${navYear}`;
  }, [viewMode, navYear, navMonth, navDay, calSys, cs]);

  return {
    calSys,
    viewMode,
    navYear,
    navMonth,
    navDay,
    setCalSys,
    setViewMode,
    handlePrev,
    handleNext,
    jumpToISO,
    titleLabel,
  };
}

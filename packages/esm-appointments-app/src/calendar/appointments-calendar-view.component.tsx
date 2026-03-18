/**
 * AppointmentsCalendarView.tsx  (replaces the existing file)
 *
 * Root component for the improved appointments calendar.
 * Responsibilities:
 *   – Owns the modal visibility state (selectedModal ISO string | null)
 *   – Delegates all navigation state to useCalendarNav
 *   – Composes CalendarHeader, view components, AppointmentsModal, CalendarLegend
 *
 * This component intentionally contains NO business logic beyond wiring;
 * all logic lives in the hook and child components.
 */

import React, { useState, useCallback } from 'react';
import { type ViewMode } from '../types/calendar.types';
import { useCalendarNav } from '../hooks/useCalendarNav';
import CalendarHeader from './header/CalendarHeader';
import MonthlyCalendarView from './monthly/MonthlyCalendarView';
import WeeklyCalendarView from './weekly/WeeklyCalendarView';
import DailyCalendarView from './daily/DailyCalendarView';
import AppointmentsModal from './modal/AppointmentsModal';
import { CalendarLegend } from './calendarAtoms';

const AppointmentsCalendarView: React.FC = () => {
  // ── Navigation state (calendar system, view mode, year/month/day) ──────
  const {
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
  } = useCalendarNav();

  // ── Modal state ──────────────────────────────────────────────────────────
  // null = closed; ISO string = open for that date
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const handleSelectDate = useCallback((iso: string) => {
    setSelectedModal(iso);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedModal(null);
  }, []);

  /**
   * Called by the modal's "Day View →" button.
   * Jumps the calendar to the given ISO date in the requested view mode
   * and dismisses the modal so the user stays in context.
   */
  const handleDrillDown = useCallback(
    (mode: ViewMode, iso: string) => {
      jumpToISO(iso, mode);
      setSelectedModal(null);
    },
    [jumpToISO],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh' }}
      data-testid="appointments-calendar">
      {/* Navigation bars */}
      <CalendarHeader
        calSys={calSys}
        viewMode={viewMode}
        titleLabel={titleLabel}
        onCalSysChange={setCalSys}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Main content */}
      <div style={{ padding: '16px 24px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
          {viewMode === 'monthly' && (
            <MonthlyCalendarView calSys={calSys} year={navYear} month={navMonth} onSelectDate={handleSelectDate} />
          )}

          {viewMode === 'weekly' && (
            <WeeklyCalendarView
              calSys={calSys}
              year={navYear}
              month={navMonth}
              day={navDay}
              onSelectDate={handleSelectDate}
            />
          )}

          {viewMode === 'daily' && <DailyCalendarView calSys={calSys} year={navYear} month={navMonth} day={navDay} />}
        </div>

        {/* Status + service colour legend */}
        <CalendarLegend />
      </div>

      {/* Modal – rendered outside the scroll container so it overlays everything */}
      {selectedModal && (
        <AppointmentsModal
          date={selectedModal}
          calSys={calSys}
          onClose={handleCloseModal}
          onDrillDown={handleDrillDown}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendarView;

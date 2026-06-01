import React, { useState, useCallback } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { CALENDAR_SYSTEMS, type CalendarSystem } from './utils/calendar-systems';
import CalendarHeader, { type CalendarViewMode } from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import DayAppointmentsModal from './day-appointments-modal/day-appointments-modal.component';

/**
 * AppointmentsCalendarView
 * Orchestrates monthly/weekly/daily views, calendar system switching,
 * and modal-based day drill-down — all without leaving the calendar page.
 */
const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();

  // ── Core state ────────────────────────────────────────────────────────────
  const [calSysKey, setCalSysKey] = useState('gregory');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));
  const [modalIsoDate, setModalIsoDate] = useState<string | null>(null);

  const calendarSystem: CalendarSystem = CALENDAR_SYSTEMS[calSysKey];

  // ── API: summary counts (used by monthly view) ────────────────────────────
  const period = viewMode === 'weekly' ? 'weekly' : viewMode === 'daily' ? 'daily' : 'monthly';
  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), period);

  // ── Calendar system change — preserve the same Gregorian date ─────────────
  const handleCalendarSystemChange = useCallback((newKey: string) => {
    setCalSysKey(newKey);
    // calendarSelectedDate stays the same Gregorian Dayjs; only display changes
  }, []);

  // ── Prev / Next navigation ────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.subtract(1, 'month'));
    else if (viewMode === 'weekly') setCalendarSelectedDate((d) => d.subtract(7, 'day'));
    else setCalendarSelectedDate((d) => d.subtract(1, 'day'));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.add(1, 'month'));
    else if (viewMode === 'weekly') setCalendarSelectedDate((d) => d.add(7, 'day'));
    else setCalendarSelectedDate((d) => d.add(1, 'day'));
  }, [viewMode]);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleSelectDate = useCallback((isoDate: string) => setModalIsoDate(isoDate), []);

  const handleDrillDown = useCallback((_mode: 'daily', isoDate: string) => {
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
    setModalIsoDate(null);
  }, []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
    setModalIsoDate(null);
  }, []);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />

      <CalendarHeader
        viewMode={viewMode}
        calendarSystem={calendarSystem}
        calendarSelectedDate={calendarSelectedDate}
        onViewModeChange={handleViewModeChange}
        onCalendarSystemChange={handleCalendarSystemChange}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          events={calendarEvents}
          calendarSelectedDate={calendarSelectedDate}
          calendarSystem={calendarSystem}
          setCalendarSelectedDate={setCalendarSelectedDate}
          onSelectDate={handleSelectDate}
        />
      )}

      {viewMode === 'weekly' && (
        <WeeklyCalendarView
          calendarSystem={calendarSystem}
          calendarSelectedDate={calendarSelectedDate}
          onSelectDate={handleSelectDate}
        />
      )}

      {viewMode === 'daily' && (
        <DailyCalendarView calendarSystem={calendarSystem} calendarSelectedDate={calendarSelectedDate} />
      )}

      {modalIsoDate && (
        <DayAppointmentsModal
          isoDate={modalIsoDate}
          calendarSystem={calendarSystem}
          onClose={() => setModalIsoDate(null)}
          onDrillDown={handleDrillDown}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendarView;

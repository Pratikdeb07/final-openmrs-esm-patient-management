/**
 * MonthlyCalendarView.tsx
 * Renders a 7-column monthly grid.
 * Each cell shows:
 *   – Day number (highlighted if today)
 *   – Total appointment count
 *   – Service pills (up to 3, then "+N more")
 * Clicking a cell with appointments opens the AppointmentsModal.
 */

import React from 'react';
import { type CalendarSystemKey } from '../../types/calendar.types';
import { CALENDAR_SYSTEMS } from '../../helpers/calendarSystems';
import { getCalendarDays, calendarDateToISO, getLocalTodayISO } from '../../helpers/calendarUtils';
import { SERVICE_COLORS } from '../../helpers/calendarConstants';
import { getAppointmentsByDate } from '../../helpers/mockAppointments';
import { ServicePill } from '../calendarAtoms';

interface MonthlyCalendarViewProps {
  calSys: CalendarSystemKey;
  year: number;
  month: number;
  onSelectDate: (iso: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ calSys, year, month, onSelectDate }) => {
  const cs = CALENDAR_SYSTEMS[calSys];
  const cells = getCalendarDays(calSys, year, month);
  const todayISO = getLocalTodayISO();

  // Day-of-week headers respect the calendar system's firstDayOfWeek
  const dowLabels = [...cs.daysOfWeek.slice(cs.firstDayOfWeek), ...cs.daysOfWeek.slice(0, cs.firstDayOfWeek)];

  return (
    <div>
      {/* Day-of-week header row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {dowLabels.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 11,
              color: '#64748b',
              padding: '8px 0',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              borderBottom: '2px solid #e2e8f0',
            }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((cell, i) => {
          if (!cell.inMonth) {
            return <div key={i} style={{ minHeight: 100, background: '#fafafa', border: '1px solid #f1f5f9' }} />;
          }

          const iso = calendarDateToISO(calSys, year, month, cell.day as number);
          const appts = getAppointmentsByDate(iso);
          const totalCount = appts.length;
          const isToday = iso === todayISO;

          // Aggregate by service
          const byService = appts.reduce<Record<string, number>>((acc, a) => {
            acc[a.service] = (acc[a.service] || 0) + 1;
            return acc;
          }, {});
          const serviceEntries = Object.entries(byService);
          const visibleServices = serviceEntries.slice(0, 3);
          const hiddenCount = serviceEntries.length - 3;

          return (
            <div
              key={i}
              role={totalCount > 0 ? 'button' : undefined}
              tabIndex={totalCount > 0 ? 0 : undefined}
              aria-label={
                totalCount > 0 ? `${cell.day}, ${totalCount} appointment${totalCount !== 1 ? 's' : ''}` : undefined
              }
              onClick={() => totalCount > 0 && onSelectDate(iso)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && totalCount > 0 && onSelectDate(iso)}
              onMouseEnter={(e) => {
                if (totalCount > 0) (e.currentTarget as HTMLElement).style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isToday ? '#f0f9ff' : '#fff';
              }}
              style={{
                minHeight: 100,
                border: '1px solid #f1f5f9',
                background: isToday ? '#f0f9ff' : '#fff',
                cursor: totalCount > 0 ? 'pointer' : 'default',
                padding: 6,
                transition: 'background 0.15s',
              }}>
              {/* Top row: count + day number */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                {totalCount > 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      color: '#0ea5e9',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    👤 {totalCount}
                  </span>
                ) : (
                  <span />
                )}
                <span
                  style={{
                    fontWeight: isToday ? 800 : 600,
                    fontSize: isToday ? 14 : 12,
                    color: isToday ? '#0ea5e9' : '#374151',
                    background: isToday ? '#bae6fd' : 'transparent',
                    borderRadius: isToday ? '50%' : 0,
                    width: isToday ? 22 : 'auto',
                    height: isToday ? 22 : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {cell.day}
                </span>
              </div>

              {/* Service pills */}
              {visibleServices.map(([svc, cnt]) => (
                <ServicePill
                  key={svc}
                  service={svc}
                  count={cnt}
                  color={SERVICE_COLORS[svc] ?? SERVICE_COLORS.default}
                />
              ))}

              {hiddenCount > 0 && (
                <div style={{ fontSize: 10, color: '#0ea5e9', fontWeight: 600, marginTop: 2 }}>+{hiddenCount} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;

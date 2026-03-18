/**
 * WeeklyCalendarView.tsx
 * Renders a 7-column, hourly time-slot grid for the week containing navDay.
 * Each cell shows appointments that start in that hour.
 * Clicking a cell with appointments opens the AppointmentsModal.
 */

import React from 'react';
import { type CalendarSystemKey } from '../../types/calendar.types';
import { CALENDAR_SYSTEMS } from '../../helpers/calendarSystems';
import { getWeekDays, getLocalTodayISO } from '../../helpers/calendarUtils';
import { SERVICE_COLORS, STATUS_COLORS, TIMELINE_START_HOUR, TIMELINE_END_HOUR } from '../../helpers/calendarConstants';
import { getAppointmentsByDate } from '../../helpers/mockAppointments';

interface WeeklyCalendarViewProps {
  calSys: CalendarSystemKey;
  year: number;
  month: number;
  day: number;
  onSelectDate: (iso: string) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ calSys, year, month, day, onSelectDate }) => {
  const cs = CALENDAR_SYSTEMS[calSys];
  const weekDays = getWeekDays(calSys, year, month, day);
  const today = getLocalTodayISO();
  const hours = Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR }, (_, i) => i + TIMELINE_START_HOUR);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '50px repeat(7, 1fr)',
          minWidth: 600,
        }}>
        {/* Corner cell */}
        <div style={{ borderBottom: '2px solid #e2e8f0' }} />

        {/* Day headers */}
        {weekDays.map((wd) => {
          const monthName = cs.months[wd.month];
          const isToday = wd.iso === today;
          return (
            <div
              key={wd.iso}
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                borderBottom: '2px solid #e2e8f0',
                background: isToday ? '#f0f9ff' : 'transparent',
              }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}>
                {cs.daysOfWeek[wd.dow]}
              </div>
              <div
                style={{
                  fontWeight: isToday ? 800 : 600,
                  fontSize: 16,
                  color: isToday ? '#0ea5e9' : '#1e293b',
                }}>
                {wd.day}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{monthName}</div>
            </div>
          );
        })}

        {/* Hourly rows */}
        {hours.map((hr) => (
          <React.Fragment key={hr}>
            {/* Hour label */}
            <div
              style={{
                padding: '4px 6px',
                fontSize: 10,
                color: '#94a3b8',
                fontWeight: 600,
                textAlign: 'right',
                borderTop: '1px solid #f1f5f9',
              }}>
              {hr % 12 || 12}
              {hr < 12 ? 'a' : 'p'}
            </div>

            {/* Day cells for this hour */}
            {weekDays.map((wd) => {
              const dayAppts = getAppointmentsByDate(wd.iso).filter((a) => parseInt(a.time.split(':')[0], 10) === hr);
              const isToday = wd.iso === today;

              return (
                <div
                  key={`${wd.iso}-${hr}`}
                  onClick={() => dayAppts.length > 0 && onSelectDate(wd.iso)}
                  role={dayAppts.length > 0 ? 'button' : undefined}
                  tabIndex={dayAppts.length > 0 ? 0 : undefined}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dayAppts.length > 0 && onSelectDate(wd.iso)}
                  style={{
                    minHeight: 44,
                    borderTop: '1px solid #f1f5f9',
                    background: isToday ? '#fafeff' : '#fff',
                    padding: 2,
                    cursor: dayAppts.length > 0 ? 'pointer' : 'default',
                  }}>
                  {dayAppts.map((a) => {
                    const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.Scheduled;
                    const svc = SERVICE_COLORS[a.service] ?? SERVICE_COLORS.default;
                    return (
                      <div
                        key={a.id}
                        style={{
                          background: `${svc}18`,
                          borderLeft: `3px solid ${svc}`,
                          borderRadius: '0 4px 4px 0',
                          padding: '2px 4px',
                          marginBottom: 1,
                          fontSize: 10,
                        }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{a.patientName}</div>
                        <div style={{ color: sc.text, fontSize: 9 }}>{a.status}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;

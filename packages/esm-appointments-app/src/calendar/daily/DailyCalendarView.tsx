/**
 * DailyCalendarView.tsx
 * Renders a full-day timeline for a single date.
 * Each hour slot shows all appointments starting in that hour,
 * with patient name, service, time, and status badge.
 */

import React from 'react';
import { type CalendarSystemKey } from '../../types/calendar.types';
import { CALENDAR_SYSTEMS } from '../../helpers/calendarSystems';
import { calendarDateToISO } from '../../helpers/calendarUtils';
import { SERVICE_COLORS, STATUS_COLORS, TIMELINE_START_HOUR, TIMELINE_END_HOUR } from '../../helpers/calendarConstants';
import { getAppointmentsByDate } from '../../helpers/mockAppointments';

interface DailyCalendarViewProps {
  calSys: CalendarSystemKey;
  year: number;
  month: number;
  day: number;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calSys, year, month, day }) => {
  const cs = CALENDAR_SYSTEMS[calSys];
  const iso = calendarDateToISO(calSys, year, month, day);
  const appointments = getAppointmentsByDate(iso);
  const monthName = cs.months[month] ?? `Month ${month + 1}`;

  const hours = Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }, (_, i) => i + TIMELINE_START_HOUR);

  return (
    <div style={{ padding: 20 }}>
      {/* Day heading */}
      <div style={{ paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          {monthName} {day}, {year}
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Hourly timeline */}
      {hours.map((hr) => {
        const hrAppts = appointments.filter((a) => parseInt(a.time.split(':')[0], 10) === hr);
        return (
          <div key={hr} style={{ display: 'flex', gap: 12 }}>
            {/* Hour label */}
            <div
              style={{
                width: 56,
                flexShrink: 0,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                paddingTop: 4,
              }}>
              {hr % 12 || 12}:00&nbsp;{hr < 12 ? 'AM' : 'PM'}
            </div>

            {/* Appointment cards */}
            <div
              style={{
                flex: 1,
                minHeight: 50,
                borderTop: '1px solid #f1f5f9',
                paddingTop: 4,
                paddingBottom: 4,
              }}>
              {hrAppts.map((a) => {
                const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.Scheduled;
                const svc = SERVICE_COLORS[a.service] ?? SERVICE_COLORS.default;
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: `${svc}12`,
                      borderLeft: `4px solid ${svc}`,
                      borderRadius: '0 8px 8px 0',
                      padding: '8px 12px',
                      marginBottom: 4,
                    }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', width: 44 }}>{a.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{a.patientName}</div>
                      <div style={{ fontSize: 11, color: svc }}>{a.service}</div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: sc.text,
                        background: sc.bg,
                        borderRadius: 10,
                        padding: '2px 8px',
                        flexShrink: 0,
                      }}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyCalendarView;

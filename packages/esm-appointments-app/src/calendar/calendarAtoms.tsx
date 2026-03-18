/**
 * calendarAtoms.tsx
 * Tiny presentational components reused across monthly, weekly, and daily views.
 * No side-effects or state – pure render components.
 */

import React from 'react';
import { type AppointmentItem } from './../types/calendar.types';
import { STATUS_COLORS, SERVICE_COLORS } from './../helpers/calendarConstants';

// ─── AppointmentBadge ─────────────────────────────────────────────────────

interface AppointmentBadgeProps {
  appointment: AppointmentItem;
}

/**
 * Compact inline badge showing time, patient name, and a status colour dot.
 * Used on monthly calendar cells.
 */
export const AppointmentBadge: React.FC<AppointmentBadgeProps> = ({ appointment }) => {
  const sc = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.Scheduled;
  return (
    <div
      style={{
        background: sc.bg,
        color: sc.text,
        borderRadius: 6,
        padding: '2px 6px',
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
      }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
      <span style={{ fontWeight: 600 }}>{appointment.time}</span>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 90,
        }}>
        {appointment.patientName}
      </span>
    </div>
  );
};

// ─── ServicePill ──────────────────────────────────────────────────────────

interface ServicePillProps {
  service: string;
  count: number;
  color: string;
}

/**
 * Left-bordered pill showing a service name and appointment count.
 * Used on monthly calendar cells.
 */
export const ServicePill: React.FC<ServicePillProps> = ({ service, count, color }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: color + '18',
      borderLeft: `3px solid ${color}`,
      borderRadius: '0 5px 5px 0',
      padding: '2px 6px',
      fontSize: 11,
      marginBottom: 2,
    }}>
    <span
      style={{
        color: '#374151',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 80,
      }}>
      {service}
    </span>
    <span style={{ fontWeight: 700, color, marginLeft: 4, flexShrink: 0 }}>{count}</span>
  </div>
);

// ─── StatusLegend ─────────────────────────────────────────────────────────

/**
 * Horizontal legend row for appointment statuses and services.
 * Rendered at the bottom of the calendar container.
 */
export const CalendarLegend: React.FC = () => (
  <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    {Object.entries(STATUS_COLORS).map(([status, sc]) => (
      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot }} />
        <span style={{ color: '#64748b' }}>{status}</span>
      </div>
    ))}
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {Object.entries(SERVICE_COLORS)
        .filter(([k]) => k !== 'default')
        .map(([svc, col]) => (
          <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 10, height: 4, borderRadius: 2, background: col }} />
            <span style={{ color: '#64748b' }}>{svc}</span>
          </div>
        ))}
    </div>
  </div>
);

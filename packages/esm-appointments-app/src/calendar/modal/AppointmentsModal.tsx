/**
 * AppointmentsModal.tsx
 * Modal overlay that lists all appointments for a given ISO date.
 * Keeps the user in their calendar context (no page navigation).
 * Provides a "Day View →" drill-down button and per-status filter tabs.
 */

import React, { useState } from 'react';
import { type CalendarSystemKey, type ViewMode } from '../../types/calendar.types';
import { STATUS_COLORS, SERVICE_COLORS } from '../../helpers/calendarConstants';
import { isoToCalendarDate } from '../../helpers/calendarUtils';
import { CALENDAR_SYSTEMS } from '../../helpers/calendarSystems';
import { getAppointmentsByDate } from '../../helpers/mockAppointments';

interface AppointmentsModalProps {
  /** ISO date string for the selected day (YYYY-MM-DD). */
  date: string;
  calSys: CalendarSystemKey;
  onClose: () => void;
  onDrillDown: (mode: ViewMode, iso: string) => void;
}

type FilterStatus = 'All' | keyof typeof STATUS_COLORS;

const STATUS_KEYS = Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>;

const AppointmentsModal: React.FC<AppointmentsModalProps> = ({ date, calSys, onClose, onDrillDown }) => {
  const [filter, setFilter] = useState<FilterStatus>('All');

  const cs = CALENDAR_SYSTEMS[calSys];
  const calDate = isoToCalendarDate(calSys, date);
  const monthName = cs.months[calDate.month] ?? `Month ${calDate.month + 1}`;
  const displayDate = `${monthName} ${calDate.day}, ${calDate.year}`;

  const allAppts = getAppointmentsByDate(date);
  const filtered = filter === 'All' ? allAppts : allAppts.filter((a) => a.status === filter);

  // Group by service
  const byService = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
    (acc[a.service] = acc[a.service] || []).push(a);
    return acc;
  }, {});

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Appointments for ${displayDate}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 'min(96vw, 560px)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
        {/* ── Header ── */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#0ea5e9',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
              Appointments
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{displayDate}</h2>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {allAppts.length} appointment{allAppts.length !== 1 ? 's' : ''} total
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onDrillDown('daily', date)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: '#0077a8',
              }}>
              Day View →
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 18,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              ×
            </button>
          </div>
        </div>

        {/* ── Status filter tabs ── */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', ...STATUS_KEYS] as FilterStatus[]).map((s) => {
            const count = s === 'All' ? allAppts.length : allAppts.filter((a) => a.status === s).length;
            if (s !== 'All' && count === 0) return null;
            const sc = s !== 'All' ? STATUS_COLORS[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  background: filter === s ? (sc?.bg ?? '#e0f2fe') : '#f1f5f9',
                  color: filter === s ? (sc?.text ?? '#0077a8') : '#64748b',
                }}>
                {s} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* ── Appointment list ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 24px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>No appointments found</div>
          ) : (
            Object.entries(byService).map(([svc, appts]) => {
              const svcColor = SERVICE_COLORS[svc] ?? SERVICE_COLORS.default;
              return (
                <div key={svc} style={{ marginBottom: 20 }}>
                  {/* Service heading */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: `2px solid ${svcColor}30`,
                    }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: svcColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{svc}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        fontWeight: 700,
                        color: svcColor,
                        background: `${svcColor}18`,
                        borderRadius: 10,
                        padding: '1px 8px',
                      }}>
                      {appts.length}
                    </span>
                  </div>

                  {/* Appointment rows */}
                  {appts.map((a) => {
                    const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.Scheduled;
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          marginBottom: 4,
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                        }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: '#64748b',
                            width: 44,
                            flexShrink: 0,
                          }}>
                          {a.time}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                          {a.patientName}
                        </span>
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsModal;

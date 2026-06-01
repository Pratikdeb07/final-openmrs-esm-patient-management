import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem } from '../utils/calendar-systems';
import { STATUS_STYLES, DEFAULT_STATUS_STYLE, getServiceColor } from '../utils/calendar-colors';
import styles from './day-appointments-modal.scss';

interface DayAppointmentsModalProps {
  isoDate: string;
  calendarSystem: CalendarSystem;
  onClose: () => void;
  onDrillDown: (mode: 'daily', isoDate: string) => void;
}

const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({
  isoDate,
  calendarSystem,
  onClose,
  onDrillDown,
}) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('All');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Display date in active calendar system
  const displayDate = useMemo(() => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const cal = calendarSystem.fromGregorian(y, m - 1, d);
    const mn = calendarSystem.months[cal.month] ?? `Month ${cal.month + 1}`;
    return `${mn} ${cal.day}, ${cal.year}`;
  }, [isoDate, calendarSystem]);

  const statuses = useMemo(() => ['All', ...Array.from(new Set(appointments.map((a) => a.status)))], [appointments]);

  const filtered = useMemo(
    () => (statusFilter === 'All' ? appointments : appointments.filter((a) => a.status === statusFilter)),
    [appointments, statusFilter],
  );

  const byService = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    filtered.forEach((a) => {
      const key = a.service?.name ?? t('unknownService', 'Unknown Service');
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return Array.from(map.entries());
  }, [filtered, t]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.headerLabel}>{t('appointments', 'Appointments')}</p>
            <h2 className={styles.headerTitle}>{displayDate}</h2>
            <p className={styles.headerSub}>
              {appointments.length} {t('appointmentsTotal', 'total')}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.drillDownBtn} onClick={() => onDrillDown('daily', isoDate)}>
              {t('dayView', 'Day View')} →
            </button>
            <button className={styles.closeBtn} aria-label={t('close', 'Close')} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Status filters */}
        {!isLoading && appointments.length > 0 && (
          <div className={styles.filters}>
            {statuses.map((s) => {
              const sc = s === 'All' ? null : (STATUS_STYLES[s] ?? DEFAULT_STATUS_STYLE);
              const count = s === 'All' ? appointments.length : appointments.filter((a) => a.status === s).length;
              return (
                <button
                  key={s}
                  className={styles.filterChip}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    background: statusFilter === s ? (sc?.bg ?? '#e0f2fe') : '#f1f5f9',
                    color: statusFilter === s ? (sc?.text ?? '#0369a1') : '#64748b',
                  }}>
                  {s} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {isLoading ? (
            <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>{t('noAppointmentsFound', 'No appointments found')}</p>
          ) : (
            byService.map(([svcName, appts]) => <ServiceGroup key={svcName} name={svcName} appointments={appts} />)
          )}
        </div>
      </div>
    </div>
  );
};

// ── Service group ─────────────────────────────────────────────────────────────

const ServiceGroup: React.FC<{ name: string; appointments: Appointment[] }> = ({ name, appointments }) => {
  const color = getServiceColor(name);
  return (
    <div className={styles.serviceGroup}>
      <div className={styles.serviceGroupHeader} style={{ borderBottomColor: `${color}40` }}>
        <span className={styles.serviceDot} style={{ background: color }} />
        <span className={styles.serviceName}>{name}</span>
        <span className={styles.serviceCount} style={{ background: `${color}18`, color }}>
          {appointments.length}
        </span>
      </div>
      {appointments.map((a) => (
        <AppointmentRow key={a.uuid} appointment={a} />
      ))}
    </div>
  );
};

// ── Appointment row ───────────────────────────────────────────────────────────

const AppointmentRow: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const sc = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;
  const d = new Date(appointment.startDateTime);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return (
    <div className={styles.apptRow}>
      <span className={styles.apptTime}>{time}</span>
      <span className={styles.apptName}>{appointment.patient?.name ?? '—'}</span>
      <span className={styles.apptStatus} style={{ background: sc.bg, color: sc.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default DayAppointmentsModal;

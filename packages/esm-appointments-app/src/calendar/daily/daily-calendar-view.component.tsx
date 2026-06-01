import React, { useMemo } from 'react';
import { type Dayjs } from 'dayjs';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem } from '../utils/calendar-systems';
import {
  getServiceColor,
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../utils/calendar-colors';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  calendarSystem: CalendarSystem;
  calendarSelectedDate: Dayjs;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSystem, calendarSelectedDate }) => {
  const { t } = useTranslation();

  // Format as YYYY-MM-DD in local time — matches the format useAppointmentsByDate expects
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const cal = calendarSystem.fromGregorian(
    calendarSelectedDate.year(),
    calendarSelectedDate.month(),
    calendarSelectedDate.date(),
  );
  const monthName = calendarSystem.months[cal.month] ?? `Month ${cal.month + 1}`;

  // Only render non-empty hour slots to keep the view compact
  const hourSlots = useMemo(
    () =>
      CALENDAR_HOURS.map((hr) => ({
        hr,
        appts: appointments.filter((a) => {
          const ts = a.startDateTime;
          if (ts == null) return false;
          return new Date(ts).getHours() === hr;
        }),
      })).filter((slot) => slot.appts.length > 0),
    [appointments],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h2 className={styles.title}>
          {monthName} {cal.day}, {cal.year}
        </h2>
        <p className={styles.subtitle}>
          {appointments.length === 0
            ? t('noAppointments', 'No appointments scheduled')
            : t('appointmentCount', '{{count}} appointment(s)', { count: appointments.length })}
        </p>
      </div>

      {hourSlots.length === 0 && !isLoading && appointments.length === 0 ? null : (
        <div>
          {hourSlots.map(({ hr, appts }) => (
            <div key={hr} className={styles.hourRow}>
              <div className={styles.hourLabel}>{formatHourLabel(hr)}</div>
              <div className={styles.hourSlot}>
                {appts.map((a) => (
                  <DailyAppointmentCard key={a.uuid} appointment={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Appointment card ──────────────────────────────────────────────────────────

const DailyAppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const color = getServiceColor(appointment.service?.name ?? '');
  const sc = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;

  const startTime = useMemo(() => {
    const ts = appointment.startDateTime;
    if (ts == null) return '—';
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, [appointment.startDateTime]);

  return (
    <div className={styles.apptCard} style={{ background: `${color}12`, borderLeftColor: color }}>
      <span className={styles.apptTime}>{startTime}</span>
      <div className={styles.apptDetails}>
        <div className={styles.apptName}>{appointment.patient?.name ?? '—'}</div>
        <div className={styles.apptService} style={{ color }}>
          {appointment.service?.name ?? '—'}
        </div>
      </div>
      <span className={styles.apptStatus} style={{ background: sc.bg, color: sc.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default DailyCalendarView;

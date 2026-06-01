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
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const cal = calendarSystem.fromGregorian(
    calendarSelectedDate.year(),
    calendarSelectedDate.month(),
    calendarSelectedDate.date(),
  );
  const monthName = calendarSystem.months[cal.month] ?? `Month ${cal.month + 1}`;

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

      {CALENDAR_HOURS.map((hr) => {
        const slotAppts = appointments.filter((a) => new Date(a.startDateTime).getHours() === hr);
        return (
          <div key={hr} className={styles.hourRow}>
            <div className={styles.hourLabel}>{formatHourLabel(hr)}</div>
            <div className={styles.hourSlot}>
              {slotAppts.map((a) => (
                <DailyAppointmentCard key={a.uuid} appointment={a} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Appointment card ──────────────────────────────────────────────────────────

const DailyAppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const color = getServiceColor(appointment.service?.name ?? '');
  const sc = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;

  const startTime = useMemo(() => {
    const d = new Date(appointment.startDateTime);
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

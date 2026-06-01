import React, { useMemo } from 'react';
import { type Dayjs } from 'dayjs';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem } from '../utils/calendar-systems';
import { getWeekDays, getTodayISO, type WeekDay } from '../utils/calendar-date-helpers';
import {
  getServiceColor,
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../utils/calendar-colors';
import styles from './weekly-calendar-view.scss';

interface WeeklyCalendarViewProps {
  calendarSystem: CalendarSystem;
  calendarSelectedDate: Dayjs;
  onSelectDate: (isoDate: string) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  calendarSystem,
  calendarSelectedDate,
  onSelectDate,
}) => {
  const todayISO = getTodayISO();
  const cal = calendarSystem.fromGregorian(
    calendarSelectedDate.year(),
    calendarSelectedDate.month(),
    calendarSelectedDate.date(),
  );

  const weekDays: WeekDay[] = useMemo(
    () => getWeekDays(calendarSystem.key, cal.year, cal.month, cal.day),
    [calendarSystem.key, cal.year, cal.month, cal.day],
  );

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Column headers */}
        <div className={styles.cornerCell} />
        {weekDays.map((wd) => {
          const isToday = wd.iso === todayISO;
          const dowLabel = calendarSystem.daysOfWeek[wd.dow];
          const monthName = calendarSystem.months[wd.month] ?? '';
          return (
            <div key={wd.iso} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
              <div className={styles.dowLabel}>{dowLabel}</div>
              <div className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>{wd.day}</div>
              <div className={styles.monthLabel}>{monthName}</div>
            </div>
          );
        })}

        {/* Hour rows */}
        {CALENDAR_HOURS.map((hr) => (
          <React.Fragment key={hr}>
            <div className={styles.timeLabel}>{formatHourLabel(hr)}</div>
            {weekDays.map((wd) => (
              <WeeklySlotCell
                key={wd.iso}
                isoDate={wd.iso}
                hour={hr}
                isToday={wd.iso === todayISO}
                onSelectDate={onSelectDate}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ── Single time-slot cell ─────────────────────────────────────────────────────

interface SlotCellProps {
  isoDate: string;
  hour: number;
  isToday: boolean;
  onSelectDate: (isoDate: string) => void;
}

const WeeklySlotCell: React.FC<SlotCellProps> = ({ isoDate, hour, isToday, onSelectDate }) => {
  const { appointments } = useAppointmentsByDate(isoDate);

  const slotAppts = useMemo(
    () => appointments.filter((a) => new Date(a.startDateTime).getHours() === hour),
    [appointments, hour],
  );

  return (
    <div
      onClick={() => slotAppts.length > 0 && onSelectDate(isoDate)}
      className={`${styles.slotCell} ${isToday ? styles.slotCellToday : ''} ${slotAppts.length > 0 ? styles.slotCellHasAppts : ''}`}>
      {slotAppts.map((a) => (
        <AppointmentChip key={a.uuid} appointment={a} />
      ))}
    </div>
  );
};

// ── Appointment chip ──────────────────────────────────────────────────────────

const AppointmentChip: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const color = getServiceColor(appointment.service?.name ?? '');
  const sc = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;
  return (
    <div className={styles.chip} style={{ background: `${color}18`, borderLeftColor: color }}>
      <span className={styles.chipName}>{appointment.patient?.name ?? '—'}</span>
      <span className={styles.chipStatus} style={{ color: sc.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default WeeklyCalendarView;

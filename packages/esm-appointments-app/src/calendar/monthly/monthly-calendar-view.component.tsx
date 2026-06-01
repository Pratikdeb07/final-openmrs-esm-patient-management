import React, { useCallback } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import { type CalendarSystem } from '../utils/calendar-systems';
import MonthlyHeader from './monthly-header.component';
import MonthlyViewWorkload from './monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendarSelectedDate: Dayjs;
  calendarSystem: CalendarSystem;
  setCalendarSelectedDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  events,
  calendarSelectedDate,
  calendarSystem,
  setCalendarSelectedDate,
  onSelectDate,
}) => {
  const handlePrev = useCallback(
    () => setCalendarSelectedDate((d) => d.subtract(1, 'month')),
    [setCalendarSelectedDate],
  );

  const handleNext = useCallback(() => setCalendarSelectedDate((d) => d.add(1, 'month')), [setCalendarSelectedDate]);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader
        calendarSelectedDate={calendarSelectedDate}
        calendarSystem={calendarSystem}
        onSelectPrevMonth={handlePrev}
        onSelectNextMonth={handleNext}
      />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(calendarSelectedDate).map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              dateTime={dateTime}
              events={events}
              calendarSelectedDate={calendarSelectedDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;

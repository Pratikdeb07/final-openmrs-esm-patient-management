import React from 'react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { type CalendarSystem } from '../utils/calendar-systems';
import { getOrderedDowLabels } from '../utils/calendar-date-helpers';
import styles from './monthly-header.scss';

interface MonthlyHeaderProps {
  calendarSelectedDate: Dayjs;
  calendarSystem: CalendarSystem;
  onSelectPrevMonth: () => void;
  onSelectNextMonth: () => void;
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({
  calendarSelectedDate,
  calendarSystem,
  onSelectPrevMonth,
  onSelectNextMonth,
}) => {
  const { t } = useTranslation();
  const dowLabels = getOrderedDowLabels(calendarSystem.key);

  return (
    <>
      <div className={styles.container}>
        <Button aria-label={t('previousMonth', 'Previous month')} kind="tertiary" onClick={onSelectPrevMonth} size="sm">
          {t('prev', 'Prev')}
        </Button>
        <span>{formatDate(calendarSelectedDate.toDate(), { day: false, time: false, noToday: true })}</span>
        <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={onSelectNextMonth} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>

      {/* Day-of-week column headers — changes with calendar system */}
      <div className={styles.workLoadCard}>
        {dowLabels.map((label, i) => (
          <div key={i} className={styles.dowCell}>
            {label}
          </div>
        ))}
      </div>
    </>
  );
};

export default MonthlyHeader;

import React, { useCallback, useMemo } from 'react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { CALENDAR_SYSTEMS, type CalendarSystem } from '../utils/calendar-systems';
import { getWeekDays } from '../utils/calendar-date-helpers';
import styles from './calendar-header.scss';

export type CalendarViewMode = 'monthly' | 'weekly' | 'daily';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  calendarSystem: CalendarSystem;
  /** Gregorian Dayjs representing the current nav anchor */
  calendarSelectedDate: Dayjs;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onCalendarSystemChange: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const VIEW_MODES: Array<{ key: CalendarViewMode; label: string }> = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'daily', label: 'Daily' },
];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSystem,
  calendarSelectedDate,
  onViewModeChange,
  onCalendarSystemChange,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    navigate({ to: `${spaHomePage}/appointments/${calendarSelectedDate.format('YYYY-MM-DD')}` });
  }, [calendarSelectedDate]);

  /** Title shown between Prev / Next */
  const titleLabel = useMemo(() => {
    // Convert the Gregorian date to the active calendar system
    const cal = calendarSystem.fromGregorian(
      calendarSelectedDate.year(),
      calendarSelectedDate.month(),
      calendarSelectedDate.date(),
    );
    const monthName = calendarSystem.months[cal.month] ?? `Month ${cal.month + 1}`;

    if (viewMode === 'monthly') return `${monthName} ${cal.year}`;

    if (viewMode === 'weekly') {
      const days = getWeekDays(calendarSystem.key, cal.year, cal.month, cal.day);
      const first = days[0];
      const last = days[6];
      const fm = calendarSystem.months[first.month] ?? `M${first.month + 1}`;
      const lm = calendarSystem.months[last.month] ?? `M${last.month + 1}`;
      return first.month === last.month
        ? `${fm} ${first.day}–${last.day}, ${first.year}`
        : `${fm} ${first.day} – ${lm} ${last.day}, ${last.year}`;
    }

    return `${monthName} ${cal.day}, ${cal.year}`;
  }, [viewMode, calendarSelectedDate, calendarSystem]);

  return (
    <div className={styles.calendarHeaderContainer}>
      {/* Back + navigation */}
      <div className={styles.leftGroup}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={handleBack}
          renderIcon={ArrowLeft}
          size="sm">
          <span>{t('back', 'Back')}</span>
        </Button>

        <div className={styles.navGroup}>
          <button className={styles.navButton} aria-label={t('previous', 'Previous')} onClick={onPrev}>
            ←
          </button>
          <span className={styles.titleLabel}>{titleLabel}</span>
          <button className={styles.navButton} aria-label={t('next', 'Next')} onClick={onNext}>
            →
          </button>
        </div>
      </div>

      {/* Calendar system + view toggle */}
      <div className={styles.rightGroup}>
        <select
          className={styles.calendarSelect}
          value={calendarSystem.key}
          aria-label={t('calendarSystem', 'Calendar system')}
          onChange={(e) => onCalendarSystemChange(e.target.value)}>
          {Object.values(CALENDAR_SYSTEMS).map((cs) => (
            <option key={cs.key} value={cs.key}>
              {cs.label}
            </option>
          ))}
        </select>

        <div className={styles.viewToggle} role="group" aria-label={t('viewMode', 'View mode')}>
          {VIEW_MODES.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.viewToggleButton} ${viewMode === key ? styles.viewToggleButtonActive : ''}`}
              aria-pressed={viewMode === key}
              onClick={() => onViewModeChange(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;

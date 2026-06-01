import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  calendarSelectedDate: Dayjs;
  showAllServices?: boolean;
  /** When provided, opens the modal instead of navigating away */
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({
  dateTime,
  events,
  calendarSelectedDate,
  showAllServices = false,
  onSelectDate,
}) => {
  const layout = useLayoutType();

  const currentData = useMemo(
    () => events?.find((e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dateTime.format('YYYY-MM-DD')),
    [dateTime, events],
  );

  const totalCount = useMemo(
    () => currentData?.services?.reduce((s, { count = 0 }) => s + count, 0) ?? 0,
    [currentData],
  );

  const maxVisible = layout === 'small-desktop' ? 2 : 4;

  const visibleServices = useMemo(() => {
    if (!currentData?.services) return [];
    return showAllServices ? currentData.services : currentData.services.slice(0, maxVisible);
  }, [currentData, showAllServices, maxVisible]);

  const hasHidden = useMemo(() => {
    if (!currentData?.services || showAllServices) return false;
    return currentData.services.length > maxVisible;
  }, [currentData?.services, showAllServices, maxVisible]);

  /**
   * Open the day-appointments modal only when there are appointments on this date.
   * We check totalCount (derived from the calendar summary) so the guard is consistent
   * with what the user can see on the cell.
   */
  const handleClick = () => {
    if (totalCount === 0) return;
    onSelectDate?.(dateTime.format('YYYY-MM-DD'));
  };

  return (
    <div
      onClick={handleClick}
      className={classNames(
        styles[isSameMonth(dateTime, calendarSelectedDate) ? 'monthly-cell' : 'monthly-cell-disabled'],
        !showAllServices && {
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        },
      )}>
      {isSameMonth(dateTime, calendarSelectedDate) && (
        <div>
          <span className={styles.totals}>
            {currentData?.services ? (
              <div role="button" tabIndex={0}>
                <User size={16} />
                <span>{totalCount}</span>
              </div>
            ) : (
              <div />
            )}
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
          </span>

          {currentData?.services && (
            <div className={styles.currentData}>
              {visibleServices.map(({ serviceName, serviceUuid, count }, i) => (
                <div
                  key={`${serviceUuid}-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className={styles.serviceArea}>
                  <span>{serviceName}</span>
                  <span>{count}</span>
                </div>
              ))}
              {hasHidden && (
                <MonthlyWorkloadViewExpanded
                  count={currentData.services.length - maxVisible}
                  events={events}
                  dateTime={dateTime}
                  calendarSelectedDate={calendarSelectedDate}
                  onSelectDate={onSelectDate}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;

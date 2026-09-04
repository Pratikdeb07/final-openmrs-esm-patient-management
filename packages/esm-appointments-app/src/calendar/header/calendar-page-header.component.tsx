import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageHeader, PageHeaderContent, AppointmentsPictogram } from '@openmrs/esm-framework';
import { launchCreateAppointmentForm } from '../../helpers/functions';
import { type CalendarFilterState } from '../../filter/use-calendar-filters';
import ServiceFilter from '../../filter/service-filter.component';
import styles from './calendar-page-header.scss';

interface CalendarPageHeaderProps {
  filters: CalendarFilterState;
  serviceColorMap: Map<string, string>;
}

/**
 * Top-level page header for the calendar view.
 * Renders the service filter dropdown and the New Appointment button.
 * Filter state is owned by the parent via useCalendarFilters.
 */
const CalendarPageHeader: React.FC<CalendarPageHeaderProps> = ({ filters, serviceColorMap }) => {
  const { t } = useTranslation();

  const serviceOptionsWithColor = filters.serviceOptions.map((o) => ({
    ...o,
    color: serviceColorMap.get(o.uuid),
  }));

  return (
    <PageHeader className={styles.header} data-testid="calendar-page-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={t('calendar', 'Calendar')} />
      <div className={styles.actions}>
        <div className={styles.filters}>
          <ServiceFilter
            options={serviceOptionsWithColor}
            selected={filters.serviceUuids}
            onChange={filters.onServiceChange}
          />
        </div>
        <Button kind="primary" renderIcon={Add} size="md" onClick={() => launchCreateAppointmentForm(t)}>
          {t('newAppointment', 'New appointment')}
        </Button>
      </div>
    </PageHeader>
  );
};

export default CalendarPageHeader;

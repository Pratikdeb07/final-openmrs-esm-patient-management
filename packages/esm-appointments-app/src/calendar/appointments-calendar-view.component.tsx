import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useAppointmentSearch } from '../hooks/useAppointmentSearch';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { type CalendarViewMode } from '../types';
import { omrsDateFormat } from '../constants';
import { buildServiceColorMap } from './utils/calendar-colors';
import { filterAppointments, aggregateDailyCountsByService } from './utils/calendar-filters';
import { useCalendarFilters } from './filter/use-calendar-filters';
import CalendarPageHeader from './header/calendar-page-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import ServicesLegend from './services-legend.component';
import styles from './appointments-calendar-view-view.scss';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));

  const { serviceTypes } = useAppointmentServices();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  // Fast summary path: one GET, returns per-service counts for the entire month
  const { calendarEvents: summaryEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode);

  // Full-data path: fetched when provider or location filter is active
  const { appointments: monthlyAppointments } = useAppointmentSearch(
    viewMode === 'monthly' ? calendarSelectedDate : null,
  );

  // Filter state and options live here — no filter logic in the calendar view itself
  const filters = useCalendarFilters(monthlyAppointments);

  const hasProviderOrLocationFilter = filters.providerUuids.length > 0 || filters.locationUuids.length > 0;
  const hasServiceFilter = filters.serviceUuids.length > 0;

  const filteredSummaryEvents = useMemo(() => {
    if (!summaryEvents) return [];
    if (!hasServiceFilter) return summaryEvents;
    return summaryEvents
      .map((event) => ({
        ...event,
        services: (event.services ?? []).filter((s) => filters.serviceUuids.includes(s.serviceUuid)),
      }))
      .filter((event) => event.services.length > 0);
  }, [summaryEvents, hasServiceFilter, filters.serviceUuids]);

  const filteredMonthlyEvents = useMemo(() => {
    if (viewMode !== 'monthly' || !hasProviderOrLocationFilter) return null;
    return aggregateDailyCountsByService(
      filterAppointments(monthlyAppointments, {
        serviceUuids: filters.serviceUuids,
        providerUuids: filters.providerUuids,
        locationUuids: filters.locationUuids,
      }),
    );
  }, [
    viewMode,
    hasProviderOrLocationFilter,
    monthlyAppointments,
    filters.serviceUuids,
    filters.providerUuids,
    filters.locationUuids,
  ]);

  const calendarEvents =
    viewMode === 'monthly'
      ? hasProviderOrLocationFilter
        ? filteredMonthlyEvents
        : filteredSummaryEvents
      : summaryEvents;

  const appointmentCount = useMemo(
    () =>
      (calendarEvents ?? []).reduce(
        (sum, event) => sum + (event.services ?? []).reduce((s, svc) => s + (svc.count ?? 0), 0),
        0,
      ),
    [calendarEvents],
  );

  // Derive legend entries from whatever events are currently displayed
  const legendServices = useMemo(() => {
    const map = new Map<string, { uuid: string; name: string }>();
    (calendarEvents ?? []).forEach((event) => {
      event.services?.forEach((svc) => {
        const key = svc.serviceUuid || svc.serviceName;
        if (svc.serviceName && key && !map.has(key)) {
          map.set(key, { name: svc.serviceName, uuid: svc.serviceUuid ?? key });
        }
      });
    });
    return Array.from(map.values());
  }, [calendarEvents]);

  const handlePrev = useCallback(() => {
    setCalendarSelectedDate((d) => (viewMode === 'monthly' ? d.subtract(1, 'month') : d.subtract(1, 'day')));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCalendarSelectedDate((d) => (viewMode === 'monthly' ? d.add(1, 'month') : d.add(1, 'day')));
  }, [viewMode]);

  const handleToday = useCallback(() => setCalendarSelectedDate(dayjs()), []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => setViewMode(mode), []);

  const handleSelectDate = useCallback((isoDate: string) => {
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
  }, []);

  return (
    <div data-testid="appointments-calendar" className={styles.backgroundColor}>
      <CalendarPageHeader filters={filters} serviceColorMap={serviceColorMap} />
      <CalendarHeader
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        appointmentCount={appointmentCount}
        onViewModeChange={handleViewModeChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          events={calendarEvents ?? []}
          calendarSelectedDate={calendarSelectedDate}
          onSelectDate={handleSelectDate}
          serviceColorMap={serviceColorMap}
        />
      )}
      {viewMode === 'daily' && (
        <DailyCalendarView calendarSelectedDate={calendarSelectedDate} serviceColorMap={serviceColorMap} />
      )}
      <ServicesLegend services={legendServices} serviceColorMap={serviceColorMap} />
    </div>
  );
};

export default AppointmentsCalendarView;

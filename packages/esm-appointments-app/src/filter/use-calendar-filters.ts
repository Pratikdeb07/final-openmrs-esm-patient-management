import { useState, useMemo, useCallback } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';

export interface FilterOption {
  uuid: string;
  label: string;
}

export interface CalendarFilterState {
  serviceUuids: string[];
  serviceOptions: FilterOption[];
  onServiceChange: (selected: string[]) => void;
  hasAnyFilter: boolean;
}

/**
 * Owns calendar service filter state and builds option lists for services.
 */
export function useCalendarFilters(): CalendarFilterState {
  const { serviceTypes } = useAppointmentServices();

  const [serviceUuids, setServiceUuids] = useState<string[]>([]);

  const serviceOptions = useMemo<FilterOption[]>(
    () => serviceTypes.map((s) => ({ uuid: s.uuid, label: s.name })),
    [serviceTypes],
  );

  const onServiceChange = useCallback((selected: string[]) => setServiceUuids(selected), []);

  const hasAnyFilter = serviceUuids.length > 0;

  return {
    serviceUuids,
    serviceOptions,
    onServiceChange,
    hasAnyFilter,
  };
}

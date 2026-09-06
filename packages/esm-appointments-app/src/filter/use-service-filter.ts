import { useState, useMemo, useCallback } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';

export interface ServiceFilterOption {
  uuid: string;
  label: string;
}

/**
 * Owns the calendar's service filter selection.
 * Single source of service types for the calendar page — options and
 * the color map are both derived from here. The selection is applied
 * client-side because the summary endpoint takes no filter params.
 */
export function useServiceFilter() {
  const { serviceTypes } = useAppointmentServices();
  const [selectedServiceUuids, setSelectedServiceUuids] = useState<string[]>([]);

  const serviceOptions = useMemo<ServiceFilterOption[]>(
    () => serviceTypes.map((service) => ({ uuid: service.uuid, label: service.name })),
    [serviceTypes],
  );

  const onServiceChange = useCallback((selected: string[]) => setSelectedServiceUuids(selected), []);

  return { selectedServiceUuids, serviceTypes, serviceOptions, onServiceChange };
}

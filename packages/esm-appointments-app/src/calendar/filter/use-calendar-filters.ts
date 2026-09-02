import { useState, useMemo, useCallback } from 'react';
import { useLocations, type OpenmrsResource } from '@openmrs/esm-framework';
import { useAppointmentServices } from '../../hooks/useAppointmentService';
import { useProviders } from '../../hooks/useProviders';
import { type Appointment } from '../../types';
import { extractProviderOptions, extractLocationOptions } from '../utils/calendar-filters';

export interface FilterOption {
  uuid: string;
  label: string;
}

export interface CalendarFilterState {
  serviceUuids: string[];
  providerUuids: string[];
  locationUuids: string[];
  serviceOptions: FilterOption[];
  providerOptions: FilterOption[];
  locationOptions: FilterOption[];
  onServiceChange: (selected: string[]) => void;
  onProviderChange: (selected: string[]) => void;
  onLocationChange: (selected: string[]) => void;
  hasAnyFilter: boolean;
}

/**
 * Owns all calendar filter state and builds option lists for service, provider, and location.
 * Accepts the current month's appointments so provider/location options can be enriched
 * from real data in addition to the global API lists.
 */
export function useCalendarFilters(appointments: Array<Appointment>): CalendarFilterState {
  const { serviceTypes } = useAppointmentServices();
  const { providers } = useProviders();
  const locations = useLocations();

  const [serviceUuids, setServiceUuids] = useState<string[]>([]);
  const [providerUuids, setProviderUuids] = useState<string[]>([]);
  const [locationUuids, setLocationUuids] = useState<string[]>([]);

  const serviceOptions = useMemo<FilterOption[]>(
    () => serviceTypes.map((s) => ({ uuid: s.uuid, label: s.name })),
    [serviceTypes],
  );

  const providerOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    (providers ?? []).forEach((p: OpenmrsResource & { person?: OpenmrsResource }) => {
      if (p?.uuid) map.set(p.uuid, p.person?.display ?? p.display ?? p.uuid);
    });
    // Enrich from actual appointments in case any providers are missing from the global list
    extractProviderOptions(appointments).forEach(({ uuid, label }) => {
      if (!map.has(uuid)) map.set(uuid, label);
    });
    return Array.from(map.entries())
      .map(([uuid, label]) => ({ uuid, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [providers, appointments]);

  const locationOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    (locations ?? []).forEach((loc: OpenmrsResource) => {
      if (loc?.uuid) map.set(loc.uuid, loc.display ?? loc.uuid);
    });
    extractLocationOptions(appointments).forEach(({ uuid, label }) => {
      if (!map.has(uuid)) map.set(uuid, label);
    });
    return Array.from(map.entries())
      .map(([uuid, label]) => ({ uuid, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations, appointments]);

  const onServiceChange = useCallback((selected: string[]) => setServiceUuids(selected), []);
  const onProviderChange = useCallback((selected: string[]) => setProviderUuids(selected), []);
  const onLocationChange = useCallback((selected: string[]) => setLocationUuids(selected), []);

  const hasAnyFilter = serviceUuids.length > 0 || providerUuids.length > 0 || locationUuids.length > 0;

  return {
    serviceUuids,
    providerUuids,
    locationUuids,
    serviceOptions,
    providerOptions,
    locationOptions,
    onServiceChange,
    onProviderChange,
    onLocationChange,
    hasAnyFilter,
  };
}

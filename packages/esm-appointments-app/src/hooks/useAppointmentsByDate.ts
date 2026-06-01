import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Appointment, type AppointmentsFetchResponse } from '../types';
import { omrsDateFormat } from '../constants';

/**
 * Fetches all appointments for a given ISO date (YYYY-MM-DD).
 * SWR automatically deduplicates concurrent calls for the same date
 * (used by weekly view where multiple hour-rows share one date).
 *
 * Uses omrsDateFormat (local-timezone aware) to match the forDate format
 * expected by the OpenMRS appointments API — same as useAppointmentList.
 * Using toISOString() would produce a UTC timestamp that could shift the
 * date by ±1 day for users in non-UTC timezones.
 */
export function useAppointmentsByDate(isoDate: string | null | undefined): {
  appointments: Array<Appointment>;
  isLoading: boolean;
  error: Error | undefined;
} {
  const startOfDay = isoDate ? dayjs(isoDate).startOf('day').format(omrsDateFormat) : null;
  const url = startOfDay ? `${restBaseUrl}/appointments?forDate=${startOfDay}` : null;

  const { data, isLoading, error } = useSWR<AppointmentsFetchResponse, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  return { appointments: data?.data ?? [], isLoading, error };
}

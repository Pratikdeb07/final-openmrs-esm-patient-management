import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs, { type Dayjs } from 'dayjs';
import { omrsDateFormat } from '../constants';
import { type Appointment } from '../types';

async function fetchAllMonthlyAppointments(forDate: Dayjs): Promise<Array<Appointment>> {
  const daysInMonth = forDate.daysInMonth();
  const startOfMonth = forDate.startOf('month');

  const dayPromises = Array.from({ length: daysInMonth }, (_, i) => {
    const day = startOfMonth.add(i, 'day');
    const forDateParam = encodeURIComponent(day.startOf('day').format(omrsDateFormat));
    const url = `${restBaseUrl}/appointments?forDate=${forDateParam}`;
    return openmrsFetch<Array<Appointment>>(url).then((res) => res?.data ?? []);
  });

  const results = await Promise.allSettled(dayPromises);
  const fulfilled = results.filter((r): r is PromiseFulfilledResult<Array<Appointment>> => r.status === 'fulfilled');

  if (!fulfilled.length && results.length > 0) {
    const firstRejection = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    throw firstRejection?.reason ?? new Error('Failed to fetch monthly appointments');
  }

  const allAppointments = fulfilled.flatMap((r) => r.value);

  const uniqueMap = new Map<string, Appointment>();
  allAppointments.forEach((a) => {
    if (a?.uuid) {
      uniqueMap.set(a.uuid, a);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => {
    const aTime = Number(a.startDateTime) || new Date(a.startDateTime ?? 0).getTime() || 0;
    const bTime = Number(b.startDateTime) || new Date(b.startDateTime ?? 0).getTime() || 0;
    return aTime - bTime;
  });
}

/**
 * Fetches all appointments for a given month without hitting the backend 50-record search limit.
 * Pass null forDate to skip fetching (e.g. when no provider/location filter is active).
 */
export function useAppointmentSearch(forDate: Dayjs | null) {
  const monthKey = forDate ? forDate.format('YYYY-MM') : null;

  const { data, isLoading, error } = useSWR<Array<Appointment>, Error>(
    monthKey ? ['appointment-search-monthly', monthKey] : null,
    () => fetchAllMonthlyAppointments(forDate!),
    { errorRetryCount: 2 },
  );

  return {
    appointments: data ?? [],
    isLoading,
    error,
  };
}

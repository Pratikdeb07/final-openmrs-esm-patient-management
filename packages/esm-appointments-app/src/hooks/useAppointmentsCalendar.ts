import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import { type DailyAppointmentsCountByService } from '../types';

interface AppointmentCountMapEntry {
  allAppointmentsCount: number;
}

interface AppointmentSummaryResponse {
  appointmentService: {
    name: string;
    uuid: string;
  };
  appointmentCountMap: Map<string, AppointmentCountMapEntry>;
}

export const useAppointmentsCalendar = (
  forDate: string | null,
  period: string,
  filters?: { serviceUuids?: string[]; providerUuids?: string[]; locationUuids?: string[] },
) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  let url: string | null = null;
  if (startDate && endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    if (filters?.serviceUuids?.length) params.set('serviceUuids', filters.serviceUuids.join(','));
    if (filters?.providerUuids?.length) params.set('providerUuids', filters.providerUuids.join(','));
    if (filters?.locationUuids?.length) params.set('locationUuids', filters.locationUuids.join(','));
    url = `${restBaseUrl}/appointment/appointmentSummary?${params.toString()}`;
  }

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(
    startDate && endDate ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );
  // Transform API response into daily appointment counts grouped by service
  const results: DailyAppointmentsCountByService[] =
    data?.data.reduce((acc: DailyAppointmentsCountByService[], service) => {
      const serviceName = service.appointmentService.name;
      const serviceUuid = service.appointmentService.uuid;
      Object.entries(service.appointmentCountMap).forEach(([key, value]) => {
        const existingEntry = acc.find((entry) => entry.appointmentDate === key);
        if (existingEntry) {
          existingEntry.services.push({ serviceName, serviceUuid, count: value.allAppointmentsCount });
        } else {
          acc.push({
            appointmentDate: key,
            services: [{ serviceName, serviceUuid, count: value.allAppointmentsCount }],
          });
        }
      });
      return acc;
    }, []) ?? [];
  return { isLoading, calendarEvents: results, error };
};

function evaluateAppointmentCalendarDates(forDate: string | null, period: string) {
  if (!forDate) {
    return { startDate: null, endDate: null };
  }

  if (period === 'daily') {
    return {
      startDate: dayjs(forDate).startOf('day').format(omrsDateFormat),
      endDate: dayjs(forDate).endOf('day').format(omrsDateFormat),
    };
  }

  return {
    startDate: dayjs(forDate).startOf('month').format(omrsDateFormat),
    endDate: dayjs(forDate).endOf('month').format(omrsDateFormat),
  };
}

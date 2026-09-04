import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }}>
    {children}
  </SWRConfig>
);

const mockSummaryData = [
  {
    appointmentService: {
      name: 'Outpatient',
      uuid: 'svc-opd',
    },
    appointmentCountMap: {
      '2026-08-10': { allAppointmentsCount: 4 },
      '2026-08-12': { allAppointmentsCount: 2 },
    },
  },
  {
    appointmentService: {
      name: 'Dentistry',
      uuid: 'svc-dent',
    },
    appointmentCountMap: {
      '2026-08-10': { allAppointmentsCount: 1 },
      '2026-08-15': { allAppointmentsCount: 3 },
    },
  },
];

describe('useAppointmentsCalendar', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('fetches appointmentSummary with only startDate and endDate parameters in 1 API call', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-08-15', 'monthly'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain(`${restBaseUrl}/appointment/appointmentSummary?`);
    expect(calledUrl).toContain('startDate=2026-08-01');
    expect(calledUrl).toContain('endDate=2026-08-31');
    // Ensure no unsupported parameters are passed to the backend
    expect(calledUrl).not.toContain('serviceUuids');
    expect(calledUrl).not.toContain('providerUuids');
    expect(calledUrl).not.toContain('locationUuids');
  });

  it('returns all services when no service filter is active', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-08-15', 'monthly'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.calendarEvents).toHaveLength(3);
    const aug10 = result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-10');
    expect(aug10?.services).toEqual([
      { serviceName: 'Outpatient', serviceUuid: 'svc-opd', count: 4 },
      { serviceName: 'Dentistry', serviceUuid: 'svc-dent', count: 1 },
    ]);
  });

  it('filters services client-side when serviceUuids is specified', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(
      () => useAppointmentsCalendar('2026-08-15', 'monthly', { serviceUuids: ['svc-opd'] }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Only outpatient services should be present
    result.current.calendarEvents.forEach((event) => {
      event.services.forEach((svc) => {
        expect(svc.serviceUuid).toBe('svc-opd');
      });
    });

    const aug10 = result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-10');
    expect(aug10?.services).toEqual([{ serviceName: 'Outpatient', serviceUuid: 'svc-opd', count: 4 }]);
    // 2026-08-15 only had Dentistry, so it should not appear
    expect(result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-15')).toBeUndefined();
  });

  it('handles null forDate by not fetching', () => {
    const { result } = renderHook(() => useAppointmentsCalendar(null, 'monthly'), { wrapper });

    expect(result.current.calendarEvents).toEqual([]);
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });
});

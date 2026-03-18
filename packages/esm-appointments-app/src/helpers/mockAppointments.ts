/**
 * mockAppointments.ts
 * Static mock appointment data used during development and demos.
 * Replace `getAppointmentsByDate` with a real SWR hook against the OpenMRS
 * REST API (`/ws/rest/v1/appointment/all?forDate=<YYYY-MM-DD>`) in production.
 */

import { type AppointmentItem } from '../types/calendar.types';

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'a1',
    patientName: 'Aisha Mohamed',
    service: 'General Medicine',
    time: '09:00',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a2',
    patientName: 'John Kimani',
    service: 'General Medicine',
    time: '09:30',
    status: 'CheckedIn',
    date: '2026-03-06',
  },
  {
    id: 'a3',
    patientName: 'Fatuma Wanjiru',
    service: 'General Medicine',
    time: '10:00',
    status: 'Completed',
    date: '2026-03-06',
  },
  {
    id: 'a4',
    patientName: 'David Osei',
    service: 'General Medicine',
    time: '10:30',
    status: 'Missed',
    date: '2026-03-06',
  },
  {
    id: 'a5',
    patientName: 'Ngozi Adeyemi',
    service: 'Outpatient Dept',
    time: '08:00',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a6',
    patientName: 'Kofi Mensah',
    service: 'Outpatient Dept',
    time: '08:30',
    status: 'CheckedIn',
    date: '2026-03-06',
  },
  {
    id: 'a7',
    patientName: 'Amara Diallo',
    service: 'Outpatient Dept',
    time: '09:00',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a8',
    patientName: 'Yemi Okonkwo',
    service: 'Outpatient Dept',
    time: '09:30',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a9',
    patientName: 'Tendai Mutasa',
    service: 'Outpatient Dept',
    time: '10:00',
    status: 'Completed',
    date: '2026-03-06',
  },
  {
    id: 'a10',
    patientName: 'Siti Rahma',
    service: 'Outpatient Dept',
    time: '10:30',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  { id: 'a11', patientName: 'Binta Sow', service: 'Dental', time: '11:00', status: 'Scheduled', date: '2026-03-06' },
  {
    id: 'a12',
    patientName: 'Chidi Eze',
    service: 'Ophthalmology',
    time: '14:00',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a13',
    patientName: 'Zawadi Mwangi',
    service: 'Ophthalmology',
    time: '14:30',
    status: 'Scheduled',
    date: '2026-03-06',
  },
  {
    id: 'a14',
    patientName: 'Kwame Asante',
    service: 'General Medicine',
    time: '09:00',
    status: 'Scheduled',
    date: '2026-03-07',
  },
  {
    id: 'a15',
    patientName: 'Adaeze Obi',
    service: 'General Medicine',
    time: '09:30',
    status: 'Scheduled',
    date: '2026-03-07',
  },
  {
    id: 'a16',
    patientName: 'Hamid Al-Rashid',
    service: 'General Medicine',
    time: '10:00',
    status: 'CheckedIn',
    date: '2026-03-09',
  },
  {
    id: 'a17',
    patientName: 'Priya Sharma',
    service: 'General Medicine',
    time: '10:30',
    status: 'Scheduled',
    date: '2026-03-09',
  },
  {
    id: 'a18',
    patientName: 'Olu Falola',
    service: 'Outpatient Dept',
    time: '11:00',
    status: 'Scheduled',
    date: '2026-03-09',
  },
  {
    id: 'a19',
    patientName: 'Zainab Hassan',
    service: 'Outpatient Dept',
    time: '11:30',
    status: 'Scheduled',
    date: '2026-03-09',
  },
];

/** Returns all appointments for a given ISO date (YYYY-MM-DD). */
export function getAppointmentsByDate(isoDate: string): AppointmentItem[] {
  return MOCK_APPOINTMENTS.filter((a) => a.date === isoDate);
}

/**
 * calendar-colors.ts
 * Status badge styles and service color utilities for calendar views.
 */

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  Scheduled: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
  CheckedIn: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Completed: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  Missed: { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  Cancelled: { bg: '#fdf4ff', text: '#7e22ce', dot: '#a855f7' },
  Requested: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
};

export const DEFAULT_STATUS_STYLE: StatusStyle = STATUS_STYLES.Scheduled;

const SERVICE_PALETTE = [
  '#0ea5e9',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

/** Deterministic colour for a service name */
export function getServiceColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return SERVICE_PALETTE[Math.abs(h) % SERVICE_PALETTE.length];
}

/**
 * Full 24-hour range for weekly / daily views.
 * Previously only covered 7–18 (7 AM–6 PM), which caused appointments
 * scheduled outside those hours to silently disappear from the grid.
 */
export const CALENDAR_HOURS = Array.from({ length: 24 }, (_, i) => i);

export function formatHourLabel(h: number): string {
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

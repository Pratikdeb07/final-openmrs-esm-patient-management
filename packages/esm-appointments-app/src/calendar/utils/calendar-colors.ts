/**
 * calendar-colors.ts
 * Status badge styles and service color utilities for calendar views.
 *
 * DESIGN DECISIONS:
 * - Uses Carbon Design System CSS custom properties (--cds-*) so colors adapt to the active Carbon theme.
 *   These tokens are provided by @carbon/react and @openmrs/esm-styleguide at the CSS layer.
 * - Fallback hex values in var() are for safety during testing — in production the --cds-* tokens always resolve.
 * - Service colors use a deterministic Bernstein hash so the same service always gets the same color
 *   across sessions and renders.
 */

export interface StatusStyle {
  /** Background color / CSS value for the status badge */
  bg: string;
  /** Text color / CSS value for the status badge */
  text: string;
  /** Dot/indicator color / CSS value */
  dot: string;
}

/**
 * Default status styles reference Carbon Design System CSS custom properties.
 * These tokens are defined by @carbon/react and available at runtime via the Carbon theme layer.
 * No hardcoded hex values — colors adapt to light/dark mode and theme variants automatically.
 *
 * Fallback hex values are provided as CSS var() fallbacks for safety during testing/development
 * when Carbon's stylesheet may not be loaded. In production, the --cds-* tokens always resolve.
 */
export const STATUS_STYLES: Record<string, StatusStyle> = {
  Scheduled: {
    bg: 'var(--cds-layer-selected, #e0e0e0)',
    text: 'var(--cds-text-primary, #161616)',
    dot: 'var(--cds-support-info, #0043ce)',
  },
  CheckedIn: {
    bg: 'var(--cds-layer-accent, #e0e0e0)',
    text: 'var(--cds-support-success, #198038)',
    dot: 'var(--cds-support-success, #198038)',
  },
  Completed: {
    bg: 'var(--cds-layer, #f4f4f4)',
    text: 'var(--cds-text-secondary, #525252)',
    dot: 'var(--cds-support-success, #198038)',
  },
  Missed: {
    bg: 'var(--cds-layer, #f4f4f4)',
    text: 'var(--cds-support-error, #da1e28)',
    dot: 'var(--cds-support-error, #da1e28)',
  },
  Cancelled: {
    bg: 'var(--cds-layer, #f4f4f4)',
    text: 'var(--cds-text-secondary, #525252)',
    dot: 'var(--cds-text-disabled, #c6c6c6)',
  },
  Requested: {
    bg: 'var(--cds-layer, #f4f4f4)',
    text: 'var(--cds-support-warning, #ba4b00)',
    dot: 'var(--cds-support-warning, #ba4b00)',
  },
};

/** Fallback style for unknown statuses — uses the Scheduled/Carbon info token trio */
export const DEFAULT_STATUS_STYLE: StatusStyle = STATUS_STYLES.Scheduled;

// ── Deterministic service colour palette ─────────────────────────────────────

/**
 * Default service colour palette uses Carbon Design System's supported-* tokens.
 * These adapt to the active Carbon theme (light/dark/high-contrast).
 */
const SERVICE_PALETTE = [
  'var(--cds-support-info, #0043ce)',
  'var(--cds-support-success, #24a148)',
  'var(--cds-support-warning, #f1c21b)',
  'var(--cds-support-error, #da1e28)',
  'var(--cds-interactive, #0f62fe)',
  'var(--cds-text-secondary, #525252)',
  'var(--cds-link-primary, #0f62fe)',
  'var(--cds-button-primary, #0f62fe)',
  'var(--cds-layer-selected, #e0e0e0)',
  'var(--cds-focus, #0f62fe)',
];

/**
 * Returns a deterministic colour for a service name using a Bernstein hash (djb2 variant).
 * The same service name always produces the same colour, across all renders and user sessions.
 *
 * @example
 * getServiceColor('Cardiology') // => 'var(--cds-support-warning)'
 * getServiceColor('Dermatology') // => 'var(--cds-support-success)'
 */
export function getServiceColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return SERVICE_PALETTE[Math.abs(h) % SERVICE_PALETTE.length];
}

// ── Hour utilities ───────────────────────────────────────────────────────────

/**
 * Full 24-hour range for weekly / daily views.
 * Previously only covered 7–18 (7 AM–6 PM), which caused appointments
 * scheduled outside those hours to silently disappear from the grid.
 */
export const CALENDAR_HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Format a 24h hour (0–23) to a 12h label (e.g. 0 → "12 AM", 13 → "1 PM") */
export function formatHourLabel(h: number): string {
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

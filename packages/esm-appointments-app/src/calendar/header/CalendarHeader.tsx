/**
 * CalendarHeader.tsx
 * Top navigation bar for the appointments calendar.
 * Renders:
 *   – App title
 *   – Calendar system selector (Gregorian / Ethiopic / Islamic / Persian)
 *   – Prev / title / Next navigation
 *   – Monthly / Weekly / Daily view mode toggle
 *
 * All state is lifted to the parent (AppointmentsCalendar) via callbacks.
 */

import React from 'react';
import { type CalendarSystemKey, type ViewMode } from '../../types/calendar.types';
import { CALENDAR_SYSTEMS } from '../../helpers/calendarSystems';

interface CalendarHeaderProps {
  calSys: CalendarSystemKey;
  viewMode: ViewMode;
  titleLabel: string;
  onCalSysChange: (sys: CalendarSystemKey) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
}

const VIEW_MODES: ViewMode[] = ['monthly', 'weekly', 'daily'];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calSys,
  viewMode,
  titleLabel,
  onCalSysChange,
  onViewModeChange,
  onPrev,
  onNext,
}) => (
  <>
    {/* ── Brand bar ── */}
    <div
      style={{
        background: '#0f7a6e',
        color: '#fff',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>📅 Appointments Calendar</div>

      <select
        value={calSys}
        onChange={(e) => onCalSysChange(e.target.value as CalendarSystemKey)}
        aria-label="Calendar system"
        style={{
          padding: '5px 10px',
          borderRadius: 8,
          border: 'none',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
        {Object.entries(CALENDAR_SYSTEMS).map(([key, sys]) => (
          <option key={key} value={key} style={{ color: '#000', background: '#fff' }}>
            {sys.label}
          </option>
        ))}
      </select>
    </div>

    {/* ── Navigation bar ── */}
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
      {/* Prev / Title / Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onPrev} aria-label="Previous" style={navBtnStyle}>
          ← Prev
        </button>

        <span
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: '#0f172a',
            minWidth: 200,
            textAlign: 'center',
          }}>
          {titleLabel}
        </span>

        <button onClick={onNext} aria-label="Next" style={navBtnStyle}>
          Next →
        </button>
      </div>

      {/* View mode toggle */}
      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: 10,
          padding: 3,
          gap: 2,
        }}>
        {VIEW_MODES.map((v) => (
          <button
            key={v}
            onClick={() => onViewModeChange(v)}
            aria-pressed={viewMode === v}
            style={{
              padding: '5px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === v ? '#fff' : 'transparent',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              textTransform: 'capitalize',
              color: viewMode === v ? '#0f7a6e' : '#64748b',
              boxShadow: viewMode === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </>
);

const navBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
  color: '#0f7a6e',
};

export default CalendarHeader;

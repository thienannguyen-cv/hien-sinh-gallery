import React from 'react';
import type { AuditedRehearsalSession } from '../../services/curator/auditedRehearsal';

interface CuratorRehearsalControlsProps {
  sessions: AuditedRehearsalSession[];
  selectedSessionId: string;
  encounterCount: number;
  onSelect: (sessionId: string) => void;
  onRestart: () => void;
}

export const CuratorRehearsalControls: React.FC<CuratorRehearsalControlsProps> = ({
  sessions,
  selectedSessionId,
  encounterCount,
  onSelect,
  onRestart,
}) => {
  if (!import.meta.env.DEV || sessions.length === 0) return null;

  return (
    <div
      aria-label="Owner audit rehearsal controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 7px',
        border: '1px solid rgba(218,172,98,0.16)',
        background: 'rgba(8,10,13,0.66)',
      }}
    >
      <span className="t-mono-tag" style={{ color: 'rgba(218,172,98,0.52)', fontSize: '0.43rem' }}>
        AUDIT REHEARSAL
      </span>
      <select
        value={selectedSessionId}
        disabled={encounterCount > 0}
        onChange={event => onSelect(event.target.value)}
        aria-label="Select an audited rehearsal session"
        style={{
          maxWidth: 190,
          color: 'rgba(237,236,234,0.72)',
          background: 'rgba(6,7,8,0.92)',
          border: '1px solid rgba(232,235,238,0.12)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.52rem',
          letterSpacing: '0.04em',
          padding: '4px 6px',
        }}
      >
        {sessions.map(session => (
          <option key={session.id} value={session.id}>{session.label}</option>
        ))}
      </select>
      {encounterCount > 0 && (
        <button
          type="button"
          onClick={onRestart}
          className="t-mono-tag"
          style={{
            color: 'rgba(237,236,234,0.46)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            fontSize: '0.43rem',
          }}
        >
          NEW RUN
        </button>
      )}
    </div>
  );
};

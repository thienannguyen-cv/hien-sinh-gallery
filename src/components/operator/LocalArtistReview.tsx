import { useState } from 'react';
import { AcquisitionRehearsal } from './AcquisitionRehearsal';

type Submission = {
  submissionId: string;
  walletAddress: string;
  status: string;
  contributions: readonly string[];
};

/** Local Acceptance A only. This UI is intentionally unavailable in production
 * without a real Artist session verifier. */
export function LocalArtistReview() {
  const [token, setToken] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState('Enter the ephemeral local Artist-review token from the adapter terminal.');
  const headers = { 'x-local-artist-review': token, 'content-type': 'application/json' };
  if (window.location.pathname === '/operator/acquisition/rehearsal') return <AcquisitionRehearsal />;
  const load = async () => {
    const response = await fetch('/api/local-artist-review', { headers });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error ?? 'Artist authentication failed.');
    setSubmissions(result.submissions ?? []); setMessage('Authenticated local Artist session.');
  };
  const act = async (submissionId: string, action: 'confirm' | 'do_not_confirm' | 'revoke_invitation') => {
    const response = await fetch('/api/local-artist-review', { method: 'POST', headers, body: JSON.stringify({ submissionId, action }) });
    const result = await response.json();
    setMessage(response.ok ? `${result.status ?? 'Invitation revoked.'} No automatic authority transition occurred.` : (result.error ?? 'Action rejected.'));
    await load();
  };
  return <main style={{ minHeight: '100dvh', background: '#08090a', color: '#e9e5dc', padding: '8vw', fontFamily: 'var(--font-mono, monospace)' }}>
    <p style={{ color: '#d7af67', letterSpacing: '.14em', fontSize: '.72rem' }}>LOCAL ACCEPTANCE A · ARTIST REVIEW</p>
    <h1 style={{ fontSize: 'clamp(1.5rem,4vw,3rem)', fontWeight: 400 }}>Three Brushstrokes</h1>
    <p style={{ maxWidth: 680, lineHeight: 1.6, opacity: .7 }}>Notification is not authority. This loopback-only surface derives its operator subject from a local authenticated adapter. Production requires a separately verified Artist session.</p>
    <input aria-label="Local Artist review token" type="password" value={token} onChange={event => setToken(event.target.value)} placeholder="Ephemeral local Artist-review token" style={{ width: 'min(100%, 620px)', padding: 12, background: '#111214', border: '1px solid #665632', color: 'inherit' }} />
    <button onClick={() => void load()} style={{ display: 'block', marginTop: 12, padding: '10px 16px', background: '#2a2315', color: '#e9d6a8', border: '1px solid #806b3e' }}>OPEN PENDING REVIEW</button>
    <p aria-live="polite" style={{ marginTop: 18, opacity: .75 }}>{message}</p>
    {submissions.map(submission => <section key={submission.submissionId} style={{ marginTop: 22, borderTop: '1px solid #3a3224', paddingTop: 16 }}>
      <div style={{ fontSize: '.75rem', opacity: .7 }}>{submission.submissionId} · {submission.walletAddress}</div><p>{submission.status}</p>
      <section aria-label="Private encounter evidence" style={{ margin: '16px 0', padding: 16, border: '1px solid #4e422a', background: '#0b0c0e' }}>
        <p style={{ marginTop: 0, color: '#d7af67', letterSpacing: '.12em', fontSize: '.68rem' }}>PRIVATE ENCOUNTER EVIDENCE</p>
        {submission.contributions.map((contribution, index) => <p key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, borderTop: index ? '1px solid #30291d' : undefined, paddingTop: index ? 12 : 0 }}>
          <span style={{ color: '#c7b78f', fontSize: '.72rem' }}>BRUSHSTROKE {index + 1} · </span>{contribution}
        </p>)}
      </section>
      <button onClick={() => void act(submission.submissionId, 'confirm')} disabled={submission.status !== 'PENDING_ARTIST_REVIEW'}>CONFIRM ENCOUNTER EVIDENCE</button>{' '}
      <button onClick={() => void act(submission.submissionId, 'do_not_confirm')} disabled={submission.status !== 'PENDING_ARTIST_REVIEW'}>DO NOT CONFIRM ENCOUNTER EVIDENCE</button>{' '}
      <button onClick={() => void act(submission.submissionId, 'revoke_invitation')}>REVOKE INVITATION</button>
    </section>)}
  </main>;
}

export interface AcceptanceAPreflightState {
  provider: string;
  network: string;
  account: string;
  accountType: string;
  verificationModel: string;
  status: string;
}

export function AcceptanceAPreSignPanel({ preflight }: { preflight: AcceptanceAPreflightState }) {
  return (
    <div aria-live="polite" style={{ marginBottom: 16, padding: 12, border: '1px solid rgba(218,172,98,0.18)', background: 'rgba(218,172,98,0.035)' }}>
      <div className="t-mono-tag" style={{ color: 'var(--g-text-accent)', fontSize: '0.54rem', marginBottom: 7 }}>LOCAL ACCEPTANCE-A PRE-SIGN CHECK</div>
      {[
        ['Provider', preflight.provider], ['Network', preflight.network], ['Account', preflight.account],
        ['Account Type', preflight.accountType], ['Verification Model', preflight.verificationModel], ['Pre-sign Status', preflight.status],
      ].map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', borderBottom: '1px solid rgba(232,235,238,0.045)' }}>
          <span className="t-mono-tag" style={{ opacity: 0.5, fontSize: '0.52rem' }}>{label}</span>
          <span className="t-mono-tag" style={{ color: value === 'READY' ? 'var(--g-text-accent)' : 'var(--g-text-primary)', fontSize: '0.52rem', textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

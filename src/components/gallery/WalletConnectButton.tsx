import React from 'react';
import { Wallet } from '@phosphor-icons/react';
import { useWallet } from '../../wallet/WalletContext';

function abbreviated(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const WalletConnectButton: React.FC = () => {
  const { address, chainId, status, error, connect } = useWallet();
  const isConnected = status === 'connected' && address !== null;

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => void connect()}
        disabled={status === 'connecting' || isConnected}
        className="t-mono-label"
        style={{
          width: '100%',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: isConnected ? 'rgba(232,235,238,0.035)' : 'rgba(218,172,98,0.08)',
          border: `1px solid ${isConnected ? 'rgba(232,235,238,0.14)' : 'rgba(218,172,98,0.35)'}`,
          color: isConnected ? 'rgba(237,236,234,0.65)' : 'var(--g-text-accent)',
          cursor: isConnected || status === 'connecting' ? 'default' : 'pointer',
          letterSpacing: '0.15em',
          fontSize: '0.56rem',
        }}
      >
        <Wallet size={14} weight="light" />
        {isConnected ? `WALLET CONNECTED — ${abbreviated(address)}` : status === 'connecting' ? 'CONNECTING WALLET…' : 'CONNECT WALLET'}
      </button>
      {isConnected && chainId !== null && (
        <p className="t-mono-tag" style={{ marginTop: 6, opacity: 0.38, fontSize: '0.52rem', textAlign: 'center' }}>
          CONNECTED NETWORK — {chainId}
        </p>
      )}
      {error && (
        <p className="t-mono-tag" role="status" style={{ marginTop: 6, color: 'rgba(237,236,234,0.52)', fontSize: '0.52rem', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  );
};

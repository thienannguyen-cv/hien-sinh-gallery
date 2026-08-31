import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Eip1193Provider = {
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: 'accountsChanged' | 'chainChanged', listener: (value: string[] | string) => void) => void;
  removeListener?: (event: 'accountsChanged' | 'chainChanged', listener: (value: string[] | string) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  status: 'idle' | 'connecting' | 'connected' | 'unavailable' | 'error';
  error: string | null;
  connect: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

function readAccount(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : null;
}

function readChainId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^0x[0-9a-f]+$/i.test(value)) return null;
  const chainId = Number.parseInt(value, 16);
  return Number.isSafeInteger(chainId) ? chainId : null;
}

export const WalletProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletState['status']>('idle');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      setStatus('unavailable');
      return;
    }
    const [accounts, chain] = await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    const nextAddress = readAccount(accounts);
    setAddress(nextAddress);
    setChainId(readChainId(chain));
    setStatus(nextAddress ? 'connected' : 'idle');
  }, []);

  useEffect(() => {
    void refresh().catch(() => setStatus('error'));
    const provider = window.ethereum;
    if (!provider?.on) return;
    const accountsChanged = (accounts: string[] | string) => {
      setAddress(readAccount(accounts));
      setStatus(readAccount(accounts) ? 'connected' : 'idle');
    };
    const chainChanged = (value: string[] | string) => setChainId(readChainId(value));
    provider.on('accountsChanged', accountsChanged);
    provider.on('chainChanged', chainChanged);
    return () => {
      provider.removeListener?.('accountsChanged', accountsChanged);
      provider.removeListener?.('chainChanged', chainChanged);
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      setStatus('unavailable');
      setError('No compatible browser wallet was found.');
      return;
    }
    setStatus('connecting');
    setError(null);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chain = await provider.request({ method: 'eth_chainId' });
      const nextAddress = readAccount(accounts);
      setAddress(nextAddress);
      setChainId(readChainId(chain));
      setStatus(nextAddress ? 'connected' : 'idle');
      if (!nextAddress) setError('The wallet did not return an account.');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Wallet connection was not completed.');
    }
  }, []);

  const value = useMemo(() => ({ address, chainId, status, error, connect }), [address, chainId, status, error, connect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export function useWallet(): WalletState {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('useWallet must be used within WalletProvider.');
  return wallet;
}

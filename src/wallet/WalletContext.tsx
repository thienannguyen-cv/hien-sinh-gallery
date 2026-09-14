import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { accountFrom, chainIdFrom, selectProofProvider, type Eip1193Provider, type ProviderDescriptor } from './providerIdentity';

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
  provider: Eip1193Provider | null;
  providerIdentity: string | null;
  connect: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

async function discoverProviders(): Promise<ProviderDescriptor[]> {
  const announced = new Map<string, ProviderDescriptor>();
  const announce = (event: Event) => {
    const detail = (event as CustomEvent<{ info?: { uuid?: string; name?: string; rdns?: string }; provider?: Eip1193Provider }>).detail;
    if (!detail?.provider || !detail.info?.uuid || !detail.info.name) return;
    announced.set(detail.info.uuid, { id: detail.info.uuid, name: detail.info.name, rdns: detail.info.rdns, provider: detail.provider, source: 'eip6963' });
  };
  window.addEventListener('eip6963:announceProvider', announce);
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  await new Promise(resolve => window.setTimeout(resolve, 80));
  window.removeEventListener('eip6963:announceProvider', announce);
  if (window.ethereum?.isRabby) {
    announced.set('rabby-injected', { id: 'rabby-injected', name: 'Rabby', rdns: 'io.rabby', provider: window.ethereum, source: 'explicit-rabby-injection' });
  } else if (window.ethereum && announced.size === 0) {
    announced.set('injected-ethereum', { id: 'injected-ethereum', name: 'Injected Wallet', provider: window.ethereum, source: 'eip6963' });
  }
  return [...announced.values()];
}

export const WalletProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletState['status']>('idle');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [providerIdentity, setProviderIdentity] = useState<string | null>(null);
  const preflightFingerprint = useRef<string | null>(null);

  const selectProvider = useCallback(async () => {
    const selected = selectProofProvider(await discoverProviders());
    if (!selected) throw new Error('Open this page in a browser with your wallet enabled. If several wallets are installed, select one wallet and try again.');
    setProvider(selected.provider);
    setProviderIdentity(`${selected.source}:${selected.rdns ?? selected.id}`);
    return selected;
  }, []);

  const refresh = useCallback(async () => {
    let selectedProvider = provider;
    if (!selectedProvider) {
      const selected = await selectProvider();
      selectedProvider = selected.provider;
    }
    if (!selectedProvider) {
      setStatus('unavailable');
      return;
    }
    const [accounts, chain] = await Promise.all([
      selectedProvider.request({ method: 'eth_accounts' }),
      selectedProvider.request({ method: 'eth_chainId' }),
    ]);
    const nextAddress = accountFrom(accounts);
    setAddress(nextAddress);
    setChainId(chainIdFrom(chain));
    setStatus(nextAddress ? 'connected' : 'idle');
  }, [provider, selectProvider]);

  useEffect(() => {
    void refresh().catch(() => setStatus('error'));
    const selectedProvider = provider;
    if (!selectedProvider?.on) return;
    const accountsChanged = (accounts: string[] | string) => {
      setAddress(accountFrom(accounts));
      setStatus(accountFrom(accounts) ? 'connected' : 'idle');
    };
    const chainChanged = (value: string[] | string) => setChainId(chainIdFrom(value));
    selectedProvider.on('accountsChanged', accountsChanged);
    selectedProvider.on('chainChanged', chainChanged);
    return () => {
      selectedProvider.removeListener?.('accountsChanged', accountsChanged);
      selectedProvider.removeListener?.('chainChanged', chainChanged);
    };
  }, [provider, refresh]);

  useEffect(() => {
    if (!import.meta.env.DEV || !provider || !providerIdentity) return;
    let cancelled = false;
    void (async () => {
      const [accounts, chain] = await Promise.all([
        provider.request({ method: 'eth_accounts' }),
        provider.request({ method: 'eth_chainId' }),
      ]);
      const selectedAccount = accountFrom(accounts);
      const selectedChainId = chainIdFrom(chain);
      if (!selectedAccount || !selectedChainId) return;
      const fingerprint = `${providerIdentity}:${selectedAccount.toLowerCase()}:${selectedChainId}`;
      if (cancelled || preflightFingerprint.current === fingerprint) return;
      const code = String(await provider.request({ method: 'eth_getCode', params: [selectedAccount, 'latest'] }));
      if (cancelled) return;
      preflightFingerprint.current = fingerprint;
      await fetch('/api/wallet-proof-preflight', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ providerIdentity, walletAddress: selectedAccount, chainId: selectedChainId, contractCodePresent: code !== '0x', origin: window.location.origin }),
      });
    })().catch(() => undefined);
    return () => { cancelled = true; };
  }, [provider, providerIdentity]);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    try {
      const selected = provider ? { provider } : await selectProvider();
      const accounts = await selected.provider.request({ method: 'eth_requestAccounts' });
      const chain = await selected.provider.request({ method: 'eth_chainId' });
      const nextAddress = accountFrom(accounts);
      setAddress(nextAddress);
      setChainId(chainIdFrom(chain));
      setStatus(nextAddress ? 'connected' : 'idle');
      if (!nextAddress) setError('The wallet did not return an account.');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Wallet connection was not completed.');
    }
  }, [provider, selectProvider]);

  const value = useMemo(() => ({ address, chainId, status, error, provider, providerIdentity, connect }), [address, chainId, status, error, provider, providerIdentity, connect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export function useWallet(): WalletState {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('useWallet must be used within WalletProvider.');
  return wallet;
}

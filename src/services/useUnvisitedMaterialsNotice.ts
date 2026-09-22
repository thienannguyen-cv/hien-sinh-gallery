import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../wallet/WalletContext';
import { resolveOwnedTokens, ARCHIVE_CHAIN_ID } from './archiveRetrieval';

const VISITED_EVENT = 'hien-sinh-materials-visited';

function getStorageKey(address: string): string {
  return `hien_sinh_materials_visited_${address.toLowerCase()}`;
}

export function isMaterialsVisited(address?: string | null): boolean {
  if (!address) return false;
  try {
    return localStorage.getItem(getStorageKey(address)) === 'true';
  } catch {
    return false;
  }
}

export function markMaterialsVisitedForAddress(address?: string | null): void {
  if (!address) return;
  try {
    localStorage.setItem(getStorageKey(address), 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(VISITED_EVENT, { detail: { address: address.toLowerCase() } }));
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function useUnvisitedMaterialsNotice() {
  const { address, chainId, provider } = useWallet();
  const [hasUnvisitedMaterials, setHasUnvisitedMaterials] = useState(false);

  const markVisited = useCallback(() => {
    if (address) {
      markMaterialsVisitedForAddress(address);
      setHasUnvisitedMaterials(false);
    }
  }, [address]);

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!address || !provider) {
        if (active) setHasUnvisitedMaterials(false);
        return;
      }

      // If already marked as visited in localStorage, do not pulse
      if (isMaterialsVisited(address)) {
        if (active) setHasUnvisitedMaterials(false);
        return;
      }

      // Check Base chain
      const isBaseChain = chainId === ARCHIVE_CHAIN_ID || chainId === 8453;
      if (!isBaseChain) {
        if (active) setHasUnvisitedMaterials(false);
        return;
      }

      try {
        const tokens = await resolveOwnedTokens(provider, address);
        if (active) {
          if (tokens.length > 0 && !isMaterialsVisited(address)) {
            setHasUnvisitedMaterials(true);
          } else {
            setHasUnvisitedMaterials(false);
          }
        }
      } catch {
        if (active) setHasUnvisitedMaterials(false);
      }
    };

    void checkStatus();

    const handleVisitedEvent = (e: Event) => {
      const custom = e as CustomEvent<{ address?: string }>;
      if (!custom.detail?.address || custom.detail.address === address?.toLowerCase()) {
        if (active) setHasUnvisitedMaterials(false);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (address && e.key === getStorageKey(address) && e.newValue === 'true') {
        if (active) setHasUnvisitedMaterials(false);
      }
    };

    window.addEventListener(VISITED_EVENT, handleVisitedEvent);
    window.addEventListener('storage', handleStorage);

    return () => {
      active = false;
      window.removeEventListener(VISITED_EVENT, handleVisitedEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [address, chainId, provider]);

  return {
    hasUnvisitedMaterials,
    markVisited,
  };
}

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface OverlayContextType {
  isOverlayOpen: boolean;
  activeOverlayId: string | null;
  registerOverlay: (id: string) => void;
  unregisterOverlay: (id: string) => void;
}

const OverlayContext = createContext<OverlayContextType>({
  isOverlayOpen: false,
  activeOverlayId: null,
  registerOverlay: () => {},
  unregisterOverlay: () => {},
});

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set());

  const registerOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isOverlayOpen = activeOverlays.size > 0;
  const activeOverlayId = [...activeOverlays].at(-1) ?? null;

  return (
    <OverlayContext.Provider value={{ isOverlayOpen, activeOverlayId, registerOverlay, unregisterOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
};

/** Mount inside the animated panel so background controls remain suppressed
 * until its exit animation has actually unmounted it. */
export const OverlayRegistration: React.FC<{ id: string }> = ({ id }) => {
  useRegisterOverlay(true, id);
  return null;
};

export const useOverlayContext = () => useContext(OverlayContext);

/**
 * Hook for components to automatically register/unregister an overlay when open state changes
 */
export const useRegisterOverlay = (isOpen: boolean, id: string) => {
  const { registerOverlay, unregisterOverlay } = useOverlayContext();

  useEffect(() => {
    if (isOpen) {
      registerOverlay(id);
    } else {
      unregisterOverlay(id);
    }
    return () => {
      unregisterOverlay(id);
    };
  }, [isOpen, id, registerOverlay, unregisterOverlay]);
};

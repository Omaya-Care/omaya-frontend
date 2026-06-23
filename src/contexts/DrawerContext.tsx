import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';

type DrawerType = 'add-mother' | 'discharge' | null;

interface DrawerContextValue {
  drawerType: DrawerType;
  openDrawer: (type: 'add-mother' | 'discharge') => void;
  /** Close immediately, no questions asked (use after a successful submit). */
  closeDrawer: () => void;
  /** Ask to close — runs the active form's guard (e.g. "discard progress?")
   *  if one is registered, otherwise closes. Wired to overlay-click + Escape. */
  requestCloseDrawer: () => void;
  /** A form registers a guard here; pass null to clear it. */
  setCloseHandler: (fn: (() => void) | null) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const closeHandlerRef = useRef<(() => void) | null>(null);

  const openDrawer = useCallback((type: 'add-mother' | 'discharge') => setDrawerType(type), []);
  const closeDrawer = useCallback(() => {
    closeHandlerRef.current = null;
    setDrawerType(null);
  }, []);
  const requestCloseDrawer = useCallback(() => {
    if (closeHandlerRef.current) closeHandlerRef.current();
    else setDrawerType(null);
  }, []);
  const setCloseHandler = useCallback((fn: (() => void) | null) => {
    closeHandlerRef.current = fn;
  }, []);
  const value = useMemo(
    () => ({ drawerType, openDrawer, closeDrawer, requestCloseDrawer, setCloseHandler }),
    [drawerType, openDrawer, closeDrawer, requestCloseDrawer, setCloseHandler],
  );

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

type DrawerType = 'add-mother' | 'discharge' | null;

interface DrawerContextValue {
  drawerType: DrawerType;
  openDrawer: (type: 'add-mother' | 'discharge') => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerType, setDrawerType] = useState<DrawerType>(null);

  const openDrawer = useCallback((type: 'add-mother' | 'discharge') => setDrawerType(type), []);
  const closeDrawer = useCallback(() => setDrawerType(null), []);
  const value = useMemo(
    () => ({ drawerType, openDrawer, closeDrawer }),
    [drawerType, openDrawer, closeDrawer],
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

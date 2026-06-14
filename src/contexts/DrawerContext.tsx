import React, { createContext, useContext, useState } from 'react';

type DrawerType = 'add-mother' | 'discharge' | null;

interface DrawerContextValue {
  drawerType: DrawerType;
  openDrawer: (type: 'add-mother' | 'discharge') => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerType, setDrawerType] = useState<DrawerType>(null);

  return (
    <DrawerContext.Provider value={{
      drawerType,
      openDrawer: (type) => {
        console.log('[DrawerContext] openDrawer:', type);
        setDrawerType(type);
      },
      closeDrawer: () => {
        console.log('[DrawerContext] closeDrawer');
        setDrawerType(null);
      },
    }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
};

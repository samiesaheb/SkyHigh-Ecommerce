"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MobileNavigationContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | undefined>(undefined);

export function MobileNavigationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileNavigationContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (context === undefined) {
    throw new Error('useMobileNavigation must be used within a MobileNavigationProvider');
  }
  return context;
}
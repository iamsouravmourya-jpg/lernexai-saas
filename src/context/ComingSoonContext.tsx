import React, { createContext, useContext, useState, ReactNode } from "react";

interface ComingSoonContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ComingSoonContext = createContext<ComingSoonContextType | undefined>(undefined);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ComingSoonContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ComingSoonContext.Provider>
  );
}

export function useComingSoon() {
  const context = useContext(ComingSoonContext);
  if (!context) {
    throw new Error("useComingSoon must be used within a ComingSoonProvider");
  }
  return context;
}

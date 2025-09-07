"use client";

import { createContext, useContext, useRef, useCallback } from "react";

interface PollRefetchContextType {
  registerRefetch: (refetchFn: () => void) => void;
  triggerRefetch: () => void;
}

const PollRefetchContext = createContext<PollRefetchContextType | null>(null);

export function usePollRefetch() {
  const context = useContext(PollRefetchContext);
  if (!context) {
    throw new Error("usePollRefetch must be used within PollRefetchProvider");
  }
  return context;
}

interface PollRefetchProviderProps {
  children: React.ReactNode;
}

export function PollRefetchProvider({ children }: PollRefetchProviderProps) {
  const refetchFnRef = useRef<(() => void) | null>(null);

  const registerRefetch = useCallback((refetchFn: () => void) => {
    refetchFnRef.current = refetchFn;
  }, []);

  const triggerRefetch = useCallback(() => {
    if (refetchFnRef.current) {
      refetchFnRef.current();
    }
  }, []);

  const value: PollRefetchContextType = {
    registerRefetch,
    triggerRefetch,
  };

  return (
    <PollRefetchContext.Provider value={value}>
      {children}
    </PollRefetchContext.Provider>
  );
}

import { createContext, useMemo, type ReactNode } from "react";
import type { DBContextValue, DBStrategy } from "./db.types";

export const DBContext = createContext<DBContextValue | null>(null);

interface DBProviderProps {
  strategy: DBStrategy;
  children: ReactNode;
}

export function DBProvider({ strategy, children }: DBProviderProps) {
  const value = useMemo<DBContextValue>(() => strategy, [strategy]);
  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

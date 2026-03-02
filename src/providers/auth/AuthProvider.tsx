import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthContextValue, AuthStrategy } from "./auth.types";

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  strategy: AuthStrategy;
  children: ReactNode;
}

export function AuthProvider({ strategy, children }: AuthProviderProps) {
  // rerender-lazy-state-init: use function initializer to avoid reading localStorage on every render
  const [user, setUser] = useState(() => strategy.getStoredUser());

  // rerender-functional-setstate: stable callbacks via useCallback
  const login = useCallback(
    async (username: string, password: string) => {
      const loggedInUser = await strategy.login(username, password);
      strategy.persistUser(loggedInUser);
      setUser(loggedInUser);
    },
    [strategy],
  );

  const logout = useCallback(async () => {
    await strategy.logout();
    strategy.clearUser();
    setUser(null);
  }, [strategy]);

  // rerender-derived-state: derive isAdmin from user, don't store separately
  const value = useMemo<AuthContextValue>(
    () => ({ user, isAdmin: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

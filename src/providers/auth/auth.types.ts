import type { User } from "../../types";

/** Strategy interface — swap this object to change auth provider */
export interface AuthStrategy {
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getStoredUser: () => User | null;
  persistUser: (user: User) => void;
  clearUser: () => void;
}

export interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

import type { User, UserId } from "../../types";
import type { AuthStrategy } from "./auth.types";

const STORAGE_KEY = "gsap_user";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export const localAuthStrategy: AuthStrategy = {
  login: async (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return { id: "1" as UserId, username };
    }
    throw new Error("Invalid credentials");
  },

  logout: async () => {
    /* no-op for local, cleanup handled by clearUser */
  },

  getStoredUser: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as User) : null;
  },

  persistUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

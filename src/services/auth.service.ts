import { User } from "../types";

class LocalAuthService {
  private currentUser: User | null = null;

  constructor() {
    const saved = localStorage.getItem("gsap_user");
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  }

  async login(username: string, pass: string): Promise<User> {
    // Hardcoded simple check
    if (username === "admin" && pass === "admin123") {
      const user = { id: "1", username };
      this.currentUser = user;
      localStorage.setItem("gsap_user", JSON.stringify(user));
      return user;
    }
    throw new Error("Invalid credentials");
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem("gsap_user");
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const authService = new LocalAuthService();

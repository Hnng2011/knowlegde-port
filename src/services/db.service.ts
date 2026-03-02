import type { GSAPSession } from "../types";

class LocalDBService {
  private getStorage(): GSAPSession[] {
    const data = localStorage.getItem("gsap_sessions");
    return data ? JSON.parse(data) : [];
  }

  private saveStorage(sessions: GSAPSession[]) {
    localStorage.setItem("gsap_sessions", JSON.stringify(sessions));
  }

  async getSessions(): Promise<GSAPSession[]> {
    return this.getStorage();
  }

  async getSessionById(id: string): Promise<GSAPSession | null> {
    const sessions = this.getStorage();
    return sessions.find((s) => s.id === id) || null;
  }

  async saveSession(
    session: Omit<GSAPSession, "id" | "createdAt" | "updatedAt">,
  ): Promise<GSAPSession> {
    const sessions = this.getStorage();
    const newSession: GSAPSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    this.saveStorage(sessions);
    return newSession;
  }

  async updateSession(
    id: string,
    updates: Partial<GSAPSession>,
  ): Promise<GSAPSession> {
    const sessions = this.getStorage();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Session not found");

    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveStorage(sessions);
    return sessions[index];
  }
}

export const dbService = new LocalDBService();

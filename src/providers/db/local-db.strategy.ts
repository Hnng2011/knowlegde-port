import type {
  GSAPSession,
  SessionId,
  ISODateString,
  CreateSessionInput,
  UpdateSessionInput,
} from "../../types";
import type { DBStrategy } from "./db.types";

const STORAGE_KEY = "gsap_sessions";

function readSessions(): GSAPSession[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? (JSON.parse(data) as GSAPSession[]) : [];
}

function writeSessions(sessions: GSAPSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export const localDBStrategy: DBStrategy = {
  getSessions: async () => readSessions(),

  getSessionById: async (id) => readSessions().find((s) => s.id === id) ?? null,

  saveSession: async (input: CreateSessionInput) => {
    const sessions = readSessions();
    const newSession: GSAPSession = {
      ...input,
      id: crypto.randomUUID() as SessionId,
      createdAt: new Date().toISOString() as ISODateString,
      updatedAt: new Date().toISOString() as ISODateString,
    };
    sessions.push(newSession);
    writeSessions(sessions);
    return newSession;
  },

  updateSession: async (id: string, updates: UpdateSessionInput) => {
    const sessions = readSessions();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Session not found");
    sessions[idx] = {
      ...sessions[idx],
      ...updates,
      updatedAt: new Date().toISOString() as ISODateString,
    };
    writeSessions(sessions);
    return sessions[idx];
  },

  deleteSession: async (id) => {
    const sessions = readSessions().filter((s) => s.id !== id);
    writeSessions(sessions);
  },
};

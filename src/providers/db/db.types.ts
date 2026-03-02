import type {
  GSAPSession,
  CreateSessionInput,
  UpdateSessionInput,
} from "../../types";

/** Strategy interface — swap this object to change database provider */
export interface DBStrategy {
  getSessions: () => Promise<GSAPSession[]>;
  getSessionById: (id: string) => Promise<GSAPSession | null>;
  saveSession: (session: CreateSessionInput) => Promise<GSAPSession>;
  updateSession: (
    id: string,
    updates: UpdateSessionInput,
  ) => Promise<GSAPSession>;
  deleteSession: (id: string) => Promise<void>;
}

export interface DBContextValue extends DBStrategy {}

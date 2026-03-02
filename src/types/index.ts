/**
 * Branded type for UUID strings — prevents mixing plain strings with IDs.
 * @see typescript-advanced-types: Pattern 6 (Discriminated Unions)
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

/** Branded UUID type for session identifiers */
export type SessionId = Brand<string, "SessionId">;

/** Branded UUID type for user identifiers */
export type UserId = Brand<string, "UserId">;

/** ISO 8601 datetime string */
export type ISODateString = Brand<string, "ISODateString">;

/**
 * Represents a single GSAP learning session containing
 * code files that can be loaded into the Sandpack playground.
 */
export interface GSAPSession {
  readonly id: SessionId;
  readonly title: string;
  readonly description: string;
  readonly isPublic: boolean;
  /** Sandpack file map: key is the file path (e.g. "/App.tsx"), value is the code content */
  readonly files: Readonly<Record<string, string>>;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

/**
 * Mutable input for creating a new session.
 * Omits auto-generated fields (id, timestamps).
 */
export type CreateSessionInput = Omit<
  GSAPSession,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Partial update input for an existing session.
 * All fields are optional except the ID.
 */
export type UpdateSessionInput = Partial<
  Omit<GSAPSession, "id" | "createdAt" | "updatedAt">
>;

/**
 * Authenticated user profile.
 */
export interface User {
  readonly id: UserId;
  readonly username: string;
}

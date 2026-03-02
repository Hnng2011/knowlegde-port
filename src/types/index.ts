export interface GSAPSession {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  files: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
}

# GSAP Portfolio & Playground Implementation Plan

> **MUST:** REQUIRED SUB-SKILL: Use @[.agent/skills/executing-plans/SKILL.md] to implement this plan task-by-task.
>
> **GLOBAL REQUIREMENTS FOR SUBCONSCIOUS/AGENT:**
> You **MUST** strictly adhere to the following 4 skills during implementation:
>
> 1. **React Architecture & Hooks:** Must follow `@[.agent/skills/vercel-react-best-practices/SKILL.md]`. Do NOT use class-based OOP for services. Use hooks, contexts, and pure functions.
> 2. **Types & Schema:** Must follow `@[.agent/skills/typescript-advanced-types/SKILL.md]`. Strongly type all responses, use JSDoc, branded types for IDs, utility types (Omit/Partial) to prevent untyped `any` or loose types.
> 3. **Styling & CSS:** Must follow `@[.agent/skills/tailwind-design-system/SKILL.md]`. Ensure you use Tailwind CSS v4 patterns (`@import "tailwindcss"`, CSS-first configuration via `@theme`, avoid `tailwind.config.ts`, use `twMerge` + `clsx` via `cn()` utility).
> 4. **Frontend Design & UX Mastery:** Must strictly follow `@[.agent/skills/anthropic-frontend-design/SKILL.md]` for clean and modern UI theme.

**Goal:** Build a React/Vite-based portfolio and interactive GSAP learning journal with role-based Sandpack code editing.

**Architecture:** Client-side rendered React application with dependency-injected Authentication and Database services for local-first storage, designed to be extensible to Supabase in the future. Features a dual-pane CodeSandbox-powered code editor (Sandpack) for React+GSAP.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, Hero UI, `@codesandbox/sandpack-react`, React Router, Zustand (or Context).

---

### Task 1: Scaffolding & Setup

**Goal:** Initialize the Vite project, configure Tailwind, Hero UI, and React Router.

**Files:**

- Create: `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`
- Create: `src/index.css`

**Step 1: Install & Scaffold Project**

Run:

```bash
npm create vite@latest . -- --template react-ts -y
npm install
npm install react-router-dom @codesandbox/sandpack-react clsx tailwind-merge framer-motion lucide-react
npm install tailwindcss @tailwindcss/vite
npm install @heroui/react
```

**Step 2: Configure Tailwind v4 & Hero UI**

Modify `vite.config.ts` to include the tailwind plugin:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Modify `src/index.css` to import Tailwind v4 and include HeroUI sources:

```css
@import "tailwindcss";
@source "../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}";
```

Modify `src/main.tsx` to wrap App with Providers:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

**Step 3: Run the dev server to verify setup**

Run: `npm run dev`
Verify: App starts without errors, styling works.

**Step 4: Commit**

```bash
git add .
git commit -m "chore: initial project setup with tailwind, hero ui, and sandpack"
```

---

### Task 2: Service Abstraction (Auth & Database) — Hooks + Context Pattern

> **IMPORTANT:** Follow `@[.agent/skills/vercel-react-best-practices/SKILL.md]` when writing all React code.
> **DO NOT use class-based services.** Use React Context + Provider + Custom Hooks pattern instead.

**Goal:** Create type definitions, React Context providers, and custom hooks for Auth and DB. Pure functions handle data access logic; React state + context handle reactivity and DI. The provider accepts a "strategy" object so swapping to Supabase later only requires changing the strategy, not any consuming component.

**Files:**

- Create: `src/types/index.ts`
- Create: `src/providers/auth/auth.types.ts`
- Create: `src/providers/auth/local-auth.strategy.ts`
- Create: `src/providers/auth/AuthProvider.tsx`
- Create: `src/hooks/useAuth.ts`
- Create: `src/providers/db/db.types.ts`
- Create: `src/providers/db/local-db.strategy.ts`
- Create: `src/providers/db/DBProvider.tsx`
- Create: `src/hooks/useDB.ts`

**Step 1: Define shared types**

Create `src/types/index.ts`:

```typescript
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
```

**Step 2: Define Auth strategy interface & local implementation**

Create `src/providers/auth/auth.types.ts`:

```typescript
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
```

Create `src/providers/auth/local-auth.strategy.ts`:

```typescript
import type { User } from "../../types";
import type { AuthStrategy } from "./auth.types";

const STORAGE_KEY = "gsap_user";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export const localAuthStrategy: AuthStrategy = {
  login: async (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return { id: "1", username };
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
```

**Step 3: Create AuthProvider + useAuth hook**

Create `src/providers/auth/AuthProvider.tsx`:

```tsx
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
```

Create `src/hooks/useAuth.ts`:

```typescript
import { useContext } from "react";
import { AuthContext } from "../providers/auth/AuthProvider";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
```

**Step 4: Define DB strategy interface & local implementation**

Create `src/providers/db/db.types.ts`:

```typescript
import type { GSAPSession } from "../../types";

/** Strategy interface — swap this object to change database provider */
export interface DBStrategy {
  getSessions: () => Promise<GSAPSession[]>;
  getSessionById: (id: string) => Promise<GSAPSession | null>;
  saveSession: (
    session: Omit<GSAPSession, "id" | "createdAt" | "updatedAt">,
  ) => Promise<GSAPSession>;
  updateSession: (
    id: string,
    updates: Partial<GSAPSession>,
  ) => Promise<GSAPSession>;
  deleteSession: (id: string) => Promise<void>;
}

export interface DBContextValue extends DBStrategy {}
```

Create `src/providers/db/local-db.strategy.ts`:

```typescript
import type { GSAPSession } from "../../types";
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

  saveSession: async (input) => {
    const sessions = readSessions();
    const newSession: GSAPSession = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    writeSessions(sessions);
    return newSession;
  },

  updateSession: async (id, updates) => {
    const sessions = readSessions();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Session not found");
    sessions[idx] = {
      ...sessions[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeSessions(sessions);
    return sessions[idx];
  },

  deleteSession: async (id) => {
    const sessions = readSessions().filter((s) => s.id !== id);
    writeSessions(sessions);
  },
};
```

**Step 5: Create DBProvider + useDB hook**

Create `src/providers/db/DBProvider.tsx`:

```tsx
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
```

Create `src/hooks/useDB.ts`:

```typescript
import { useContext } from "react";
import { DBContext } from "../providers/db/DBProvider";

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useDB must be used within <DBProvider>");
  return ctx;
}
```

**Step 6: Wire providers in main.tsx**

Modify `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth/AuthProvider";
import { localAuthStrategy } from "./providers/auth/local-auth.strategy";
import { DBProvider } from "./providers/db/DBProvider";
import { localDBStrategy } from "./providers/db/local-db.strategy";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <AuthProvider strategy={localAuthStrategy}>
          <DBProvider strategy={localDBStrategy}>
            <App />
          </DBProvider>
        </AuthProvider>
      </HeroUIProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

> **Migration note:** To switch to Supabase later, create `supabase-auth.strategy.ts` and `supabase-db.strategy.ts` implementing the same interfaces, then swap the strategy prop in `main.tsx`. Zero changes needed in any component or hook.

**Step 7: Commit**

```bash
git add src/types src/providers src/hooks src/main.tsx
git commit -m "feat: hooks-based auth & db services with strategy pattern"
```

---

### Task 3: Root Application Shell & Routing

**Goal:** Setup React Router, Nav bar, and basic page shells.

**Files:**

- Create: `src/components/layout/Navbar.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/Portfolio.tsx`, `src/pages/Sessions.tsx`, `src/pages/Playground.tsx`, `src/pages/Login.tsx`

**Step 1: Create Page Stubs**

Create `src/pages/Portfolio.tsx`, `Sessions.tsx`, `Playground.tsx`, `Login.tsx` with simple shell exports. For example:

```tsx
export default function Portfolio() {
  return <div>Portfolio Guest View</div>;
}
```

**Step 2: Create Navbar**

Create `src/components/layout/Navbar.tsx`:
Implement a Hero UI Navigation Bar linking to `/`, `/sessions`, and displaying a Login/Logout button pulling state from `authService`.

**Step 3: Wire Routing in App.tsx**

Modify `src/App.tsx`:

```tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Portfolio from "./pages/Portfolio";
import Sessions from "./pages/Sessions";
import Playground from "./pages/Playground";
import Login from "./pages/Login";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/session/new" element={<Playground />} />
          <Route path="/session/:id" element={<Playground />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Verify navigation**
Run: `npm run dev` and click through routes.

**Step 5: Commit**

```bash
git add src/App.tsx src/pages src/components
git commit -m "feat: implement routing and app shell"
```

---

### Task 4: Setup Sandpack Playground

**Goal:** Implement the core code editor experience using Sandpack.

**Files:**

- Modify: `src/pages/Playground.tsx`

**Step 1: Scaffold Sandpack Component**

In `src/pages/Playground.tsx`, implement the Sandpack logic. Fetch the session ID from the URL (`useParams()`). If it exists, call `dbService.getSessionById`. If missing, redirect or show an error.
Pass the `files` to `Sandpack`:

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { dbService } from "../services/db.service";
import { GSAPSession } from "../types";
import { authService } from "../services/auth.service";

export default function Playground() {
  const { id } = useParams();
  const [session, setSession] = useState<GSAPSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = !!authService.getCurrentUser();

  // Basic boilerplate template for GSAP
  const defaultFiles = {
    "/App.js": `import gsap from "gsap";\nimport { useEffect, useRef } from "react";\n\nexport default function App() {\n  const boxRef = useRef(null);\n  useEffect(() => {\n    gsap.to(boxRef.current, { rotation: 360, duration: 2 });\n  }, []);\n  return <div ref={boxRef} style={{ width: 100, height: 100, background: 'blue' }} />;\n}`,
    "/package.json": JSON.stringify(
      {
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          gsap: "latest",
        },
      },
      null,
      2,
    ),
  };

  useEffect(() => {
    if (id) {
      dbService.getSessionById(id).then((data) => {
        setSession(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;

  const currentFiles = session ? session.files : defaultFiles;

  return (
    <div className="h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {session?.title || "New Session"}
        </h1>
        {isAdmin && (
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Save Configuration
          </button>
        )}
      </div>
      <SandpackProvider
        template="react"
        files={currentFiles}
        customSetup={{ dependencies: { gsap: "latest" } }}
      >
        <SandpackLayout style={{ height: "100%" }}>
          <SandpackFileExplorer />
          <SandpackCodeEditor showTabs closableTabs />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
```

_Note: In the full implementation, we need to extract the Sandpack internal state hook `useSandpack` inside a child component to be able to "Save Configuration" from the editor state back to dbService. We will handle that refinement during implementation._

**Step 2: Commit**

```bash
git add src/pages/Playground.tsx
git commit -m "feat: implement Sandpack core playground"
```

---

### Task 5: Implement Auth & Sessions List

**Goal:** Implement login form, view public sessions for guests, and create/edit controls for Admin.

**Files:**

- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Sessions.tsx`

**Step 1: Create Login logic**
Use Hero UI forms to post username/password to `authService.login()`. Redirect on success.

**Step 2: Build Sessions Master View**
List all sessions from `dbService.getSessions()`. Filter `isPublic` for Guests. Provide generic Hero UI Cards for each session linking to `/session/:id`.

**Step 3: Commit**

```bash
git add src/pages/Login.tsx src/pages/Sessions.tsx
git commit -m "feat: login flow and sessions list"
```

---

### Task 6: Polish Portfolio & Save Functionality

**Goal:** Ensure Sandpack file updates can actually be saved back using `useSandpack` and polish the general UI.

**Files:**

- Modify: `src/pages/Playground.tsx`
- Modify: `src/pages/Portfolio.tsx`

**Step 1: Playground Save button mapping**
Extract a `SaveButton` component that lives _inside_ `<SandpackProvider>` so it can access the `useActiveCode()` or `useSandpack()` context hook to read the latest `files` dictionary and submit to `dbService.updateSession(id, { files })`.

**Step 2: Add initial aesthetic elements to Portfolio**
Layout the Guest view page in `Portfolio.tsx` with attractive typography. Add a CTA link.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: complete portfolio page and playground save hook"
```

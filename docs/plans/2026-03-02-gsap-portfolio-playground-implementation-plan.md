# GSAP Portfolio & Playground Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use @[.agent/skills/executing-plans/SKILL.md] to implement this plan task-by-task.

**Goal:** Build a React/Vite-based portfolio and interactive GSAP learning journal with role-based Sandpack code editing.

**Architecture:** Client-side rendered React application with dependency-injected Authentication and Database services for local-first storage, designed to be extensible to Supabase in the future. Features a dual-pane CodeSandbox-powered code editor (Sandpack) for React+GSAP.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, Hero UI, `@codesandbox/sandpack-react`, React Router, Zustand (or Context).

---

### Task 1: Scaffolding & Setup

**Goal:** Initialize the Vite project, configure Tailwind, Hero UI, and React Router.

**Files:**

- Create: `package.json`, `tailwind.config.ts`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`
- Create: `src/index.css`

**Step 1: Install & Scaffold Project**

Run:

```bash
npm create vite@latest . -- --template react-ts -y
npm install
npm install react-router-dom @codesandbox/sandpack-react clsx tailwind-merge framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @heroui/react
```

**Step 2: Configure Tailwind & Hero UI**

Modify `tailwind.config.js` (or `.ts`):

```typescript
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
```

Modify `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
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

### Task 2: Service Abstraction (Auth & Database)

**Goal:** Create interfaces and mock local implementations for Auth and DB.

**Files:**

- Create: `src/types/index.ts`
- Create: `src/services/auth.service.ts`
- Create: `src/services/db.service.ts`

**Step 1: Define Types**

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

**Step 2: Implement Auth Service**

Create `src/services/auth.service.ts`:

```typescript
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
```

**Step 3: Implement Database Service**

Create `src/services/db.service.ts`:

```typescript
import { GSAPSession } from "../types";

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
```

**Step 4: Commit**

```bash
git add src/types src/services
git commit -m "feat: setup abstracted auth and database services"
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

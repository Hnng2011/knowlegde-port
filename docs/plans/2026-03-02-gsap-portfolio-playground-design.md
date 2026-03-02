# GSAP Learning Portfolio & Playground - Design Document

## 1. Overview & Objectives

A personal portfolio specifically designed to showcase the author's learning journey with GSAP and React. Unlike a traditional project portfolio, this application serves as an interactive journal. Users (guests) can view the portfolio and interact with a live code playground for each learning session, while the authenticated owner (admin) can log in to create, edit, and save new code sessions directly within the browser.

## 2. Architecture & Tech Stack

- **Framework:** React 19 + Vite (Client-side rendering, lightweight and fast).
- **Language:** TypeScript (Ensures strict data schemas and reliable refactoring).
- **Styling & UI:** Tailwind CSS combined with **Hero UI** for modern, accessible components.
- **Playground Engine:** `@codesandbox/sandpack-react`. Provides a powerful in-browser code editor with a file explorer and live preview, configured out-of-the-box for React + GSAP.
- **State Management:** React Context API or Zustand (for simple global state like Auth and Editor contexts).

## 3. Data Schema & Abstraction Services

To achieve maximum flexibility and allow for future migration to providers like Supabase without altering the UI logic, the application uses an abstracted service layer for Authentication and Database operations.

### 3.1 Data Schema

```typescript
interface GSAPSession {
  id: string; // UUID
  title: string; // e.g., "Lesson 1: Basic ScrollTrigger"
  description: string; // Context or notes about the session
  isPublic: boolean; // Visibility flag for guests
  files: Record<string, string>; // Sandpack file structure (filename -> code content)
  createdAt: string; // ISO Datetime string
  updatedAt: string; // ISO Datetime string
}
```

### 3.2 Service Interfaces (Dependency Injection Pattern)

- **`AuthService`**:
  - Methods: `login(username, password)`, `logout()`, `getCurrentUser()`.
  - _Initial Impl:_ `LocalAuthStrategy` (hardcoded credentials, JWT/Local Storage simulation).
  - _Future Impl:_ `SupabaseAuthStrategy`.
- **`DatabaseService`**:
  - Methods: `getSessions()`, `getSessionById(id)`, `saveSession(data)`, `updateSession(id, data)`, `deleteSession(id)`.
  - _Initial Impl:_ `LocalDBStrategy` (IndexedDB / LocalStorage).
  - _Future Impl:_ `SupabaseDBStrategy`.

## 4. Routing & Page Structure

The application is structured into four primary views:

1.  **Portfolio Landing Page (`/`)**:
    - The main entry point for guests. Details the author's skills, introduction, and highlights the learning journey. Contains a clear call-to-action (CTA) pointing to the learning journal/sessions.
2.  **Sessions List (`/sessions`)**:
    - Displays a grid/list of saved GSAP learning sessions using Hero UI cards.
    - _Guest:_ Can only see sessions where `isPublic` is true.
    - _Admin:_ Can see all sessions and has access to a "Create New Session" button.
3.  **Playground Editor (`/session/:id` or `/session/new`)**:
    - The core interactive feature utilizing Sandpack.
    - **Layout:** Top toolbar, left file explorer sidebar, middle code editor, right live preview.
    - _Guest:_ Can view the code, edit temporarily for live preview, but cannot save changes.
    - _Admin:_ Has full edit rights. For existing sessions, saving calls `updateSession`. For `/new`, saving calls `saveSession`.
4.  **Login (`/login`)**:
    - A simple Hero UI form for the admin to authenticate.

## 5. Data Flow & State Management

- **Initialization:** App checks `AuthService.getCurrentUser()` to set the global authentication context.
- **Loading a Session:** The Playground component extracts the `:id` param, calls `DatabaseService.getSessionById(id)`, formats the returned `files` record, and passes it to the `Sandpack` component.
- **Editing & Saving:** Sandpack manages its internal state. When the Admin clicks "Save", the app retrieves the current file state from Sandpack's hooks (`useSandpack`) and pushes the `Record<string, string>` via the `DatabaseService` to persist changes.

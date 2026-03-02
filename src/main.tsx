import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth/AuthProvider";
import { localAuthStrategy } from "./providers/auth/local-auth.strategy";
import { DBProvider } from "./providers/db/DBProvider";
import { localDBStrategy } from "./providers/db/local-db.strategy";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider strategy={localAuthStrategy}>
        <DBProvider strategy={localDBStrategy}>
          <App />
        </DBProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

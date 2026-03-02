import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useDB } from "../../hooks/useDB";
import type { GSAPSession } from "../../types";
import { useAuth } from "../../hooks/useAuth";

export default function Playground() {
  const { id } = useParams();
  const dbService = useDB();
  const { isAdmin } = useAuth();
  const [session, setSession] = useState<GSAPSession | null>(null);
  const [loading, setLoading] = useState(true);

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
    let active = true;

    async function fetchSession() {
      if (!id) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await dbService.getSessionById(id);
        if (active) {
          setSession(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    }

    void fetchSession();

    return () => {
      active = false; // Cleanup to prevent state updates if unmounted
    };
  }, [id, dbService]);

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

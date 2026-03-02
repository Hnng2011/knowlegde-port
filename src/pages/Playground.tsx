import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { Button, Input, Switch } from "@heroui/react";
import { useDB, useAuth } from "@/hooks";
import type { GSAPSession, CreateSessionInput } from "@/types";

// Internal save button that needs access to the Sandpack code context
function AdminSaveControls({
  session,
  onSave,
  title,
  setTitle,
  description,
  setDescription,
  isPublic,
  setIsPublic,
}: {
  session: GSAPSession | null;
  onSave: (files: Record<string, string>) => Promise<void>;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  isPublic: boolean;
  setIsPublic: (val: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // sandpack.files holds the current editor state map of { code, hidden, active }
    const fileEntries: Record<string, string> = {};
    for (const [path, fileObj] of Object.entries(sandpack.files)) {
      fileEntries[path] = fileObj.code;
    }
    await onSave(fileEntries);
    setTimeout(() => setSaving(false), 500); // UI feedback
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-default-100 rounded-lg">
      <Input
        size="sm"
        value={title}
        onValueChange={setTitle}
        placeholder="Session Title"
        className="w-64"
      />
      <Input
        size="sm"
        value={description}
        onValueChange={setDescription}
        placeholder="Description"
        className="flex-1"
      />
      <Switch isSelected={isPublic} onValueChange={setIsPublic} size="sm">
        Public
      </Switch>
      <Button
        onClick={() => void handleSave()}
        isLoading={saving}
        color={session ? "warning" : "success"}
      >
        {session ? "Update Changes" : "Save New Sandbox"}
      </Button>
    </div>
  );
}

export default function Playground() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dbService = useDB();
  const { isAdmin } = useAuth();

  const [session, setSession] = useState<GSAPSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Draft metadata state for admin
  const [title, setTitle] = useState("New Session");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Basic boilerplate template for GSAP
  const defaultFiles = {
    "/App.js": `import gsap from "gsap";\nimport { useEffect, useRef } from "react";\n\nexport default function App() {\n  const boxRef = useRef(null);\n  useEffect(() => {\n    gsap.to(boxRef.current, { rotation: 360, duration: 2 });\n  }, []);\n  return <div ref={boxRef} style={{ width: 100, height: 100, background: 'blue' }} />;\n}`,
    "/package.json": JSON.stringify(
      {
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          gsap: "latest", // Let Sandpack resolve latest GSAP
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
          if (data) {
            setTitle(data.title);
            setDescription(data.description);
            setIsPublic(data.isPublic);
          }
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    }

    void fetchSession();

    return () => {
      active = false;
    };
  }, [id, dbService]);

  const saveToDatabase = useCallback(
    async (files: Record<string, string>) => {
      try {
        if (session && id) {
          const updated = await dbService.updateSession(id, {
            title,
            description,
            isPublic,
            files,
          });
          setSession(updated); // Update local state
        } else {
          const newSession: CreateSessionInput = {
            title,
            description,
            isPublic,
            files,
          };
          const created = await dbService.saveSession(newSession);
          navigate(`/session/${created.id}`);
        }
      } catch (err) {
        console.error("Failed to save session", err);
      }
    },
    [session, id, dbService, navigate, title, description, isPublic],
  );

  if (loading) return <div>Loading...</div>;

  const currentFiles = session ? session.files : defaultFiles;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] pt-4">
      {!isAdmin && (
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {session?.title || "New Session"}
            </h1>
            <p className="text-default-500">{session?.description}</p>
          </div>
        </div>
      )}

      <SandpackProvider
        template="react"
        files={currentFiles}
        customSetup={{ dependencies: { gsap: "latest" } }}
        theme="dark"
      >
        {isAdmin && (
          <AdminSaveControls
            session={session}
            onSave={saveToDatabase}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
          />
        )}
        <SandpackLayout className="flex-1 mt-2">
          <SandpackFileExplorer autoHiddenFiles />
          <SandpackCodeEditor
            showTabs
            closableTabs
            style={{ height: "100%", width: "100%" }}
          />
          <SandpackPreview style={{ height: "100%", width: "100%" }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

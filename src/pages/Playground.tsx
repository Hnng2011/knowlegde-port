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
import { Button, Input, Spinner, Switch, Dropdown, Modal } from "@heroui/react";
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
    <div className="flex flex-wrap items-center gap-4 mb-4 bg-default-100 rounded-lg">
      <Input
        value={title}
        onChange={setTitle as any}
        placeholder="Session Title"
        className="w-64"
      />
      <Input
        value={description}
        onChange={setDescription as any}
        placeholder="Description"
        className="flex-1"
      />
      <Switch isSelected={isPublic} onChange={setIsPublic} size="sm">
        Public
      </Switch>
      <Button
        onClick={() => void handleSave()}
        isPending={saving}
        variant={session ? "danger" : "primary"}
      >
        {({ isPending }) => (
          <>
            {isPending ? (
              <Spinner color="current" size="sm" />
            ) : session ? (
              "Update Changes"
            ) : (
              "Save New Sandbox"
            )}
          </>
        )}
      </Button>
    </div>
  );
}

function PlaygroundWorkspace({ isAdmin }: { isAdmin: boolean }) {
  const { sandpack } = useSandpack();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!isAdmin) return;
      e.preventDefault();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setIsContextMenuOpen(true);
    },
    [isAdmin],
  );

  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim()) return;
    const path = newFileName.startsWith("/") ? newFileName : `/${newFileName}`;
    sandpack.addFile(path, "");
    sandpack.setActiveFile(path);
    setIsModalOpen(false);
    setNewFileName("");
  }, [newFileName, sandpack]);

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="flex-1 mt-2 relative min-h-[500px] h-full"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Dropdown
          isOpen={isContextMenuOpen}
          onOpenChange={setIsContextMenuOpen}
        >
          <Dropdown.Trigger>
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
                width: 1,
                height: 1,
              }}
            />
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom start">
            <Dropdown.Menu
              aria-label="Context Menu"
              onAction={(key) => {
                if (key === "new-file") {
                  setIsModalOpen(true);
                }
              }}
            >
              <Dropdown.Item id="new-file" textValue="New File">
                <span className="text-sm font-medium">New File</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <SandpackLayout className="flex-1 w-full h-full">
          <SandpackFileExplorer autoHiddenFiles style={{ height: "100%" }} />
          <SandpackCodeEditor
            showTabs
            closableTabs
            style={{ height: "100%", width: "100%" }}
          />
          <SandpackPreview style={{ height: "100%", width: "100%" }} />
        </SandpackLayout>
      </div>

      <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Create New File</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Input
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="/components/MyComponent.tsx"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFile();
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleCreateFile}>
                Create
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
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
        <PlaygroundWorkspace isAdmin={isAdmin} />
      </SandpackProvider>
    </div>
  );
}

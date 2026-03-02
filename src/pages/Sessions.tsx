import { useEffect, useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import { useDB, useAuth } from "@/hooks";
import type { GSAPSession } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Sessions() {
  const [sessions, setSessions] = useState<GSAPSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dbService = useDB();
  const { isAdmin } = useAuth();

  useEffect(() => {
    let active = true;
    async function loadSessions() {
      try {
        const data = await dbService.getSessions();
        if (active) {
          setSessions(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    }
    void loadSessions();
    return () => {
      active = false;
    };
  }, [dbService]);

  const visibleSessions = useMemo(() => {
    return isAdmin ? sessions : sessions.filter((s) => s.isPublic);
  }, [sessions, isAdmin]);

  if (loading) return <div>Loading Sessions...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">GSAP Learning Sessions</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/session/new")} variant="primary">
            Create New Session
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleSessions.length === 0 ? (
          <p className="text-default-500 col-span-full">No sessions found.</p>
        ) : (
          visibleSessions.map((session) => (
            <Card key={session.id} className="max-w-[400px]">
              <Card.Header className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-md font-bold">{session.title}</p>
                  <p className="text-small text-default-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-default-700">
                  {session.description}
                </p>
                {!session.isPublic && (
                  <span className="text-xs text-warning mt-2 block font-semibold">
                    Private Draft
                  </span>
                )}
              </Card.Content>
              <Card.Footer>
                <Button
                  onClick={() => navigate(`/session/${session.id}`)}
                  variant="secondary"
                  className="w-full"
                >
                  {isAdmin ? "Edit Session" : "View Code & Preview"}
                </Button>
              </Card.Footer>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

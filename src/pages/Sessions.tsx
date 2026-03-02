import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
} from "@heroui/react";
import { useDB } from "@/hooks/useDB";
import { useAuth } from "@/hooks/useAuth";
import type { GSAPSession } from "@/types";

export default function Sessions() {
  const [sessions, setSessions] = useState<GSAPSession[]>([]);
  const [loading, setLoading] = useState(true);
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
          <Button as={Link} to="/session/new" color="primary">
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
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-md font-bold">{session.title}</p>
                  <p className="text-small text-default-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-sm text-default-700">
                  {session.description}
                </p>
                {!session.isPublic && (
                  <span className="text-xs text-warning mt-2 block font-semibold">
                    Private Draft
                  </span>
                )}
              </CardBody>
              <Divider />
              <CardFooter>
                <Button
                  as={Link}
                  to={`/session/${session.id}`}
                  variant="flat"
                  color="primary"
                  className="w-full"
                >
                  {isAdmin ? "Edit Session" : "View Code & Preview"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

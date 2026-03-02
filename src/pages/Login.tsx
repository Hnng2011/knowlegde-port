import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/sessions");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (typeof window !== "undefined") {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="flex flex-col items-center pb-0 pt-2 px-4">
          <h2 className="text-2xl font-bold">Admin Login</h2>
          <p className="text-default-500 text-sm">
            Access the GSAP Playground Edit Mode
          </p>
        </CardHeader>
        <Divider className="my-4" />
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              isRequired
              label="Username"
              placeholder="Enter your username"
              value={username}
              onValueChange={setUsername}
            />
            <Input
              isRequired
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              color="primary"
              type="submit"
              isLoading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

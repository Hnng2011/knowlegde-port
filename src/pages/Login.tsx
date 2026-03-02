import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  Form,
  TextField,
  Label,
  FieldError,
  Spinner,
} from "@heroui/react";
import { useAuth } from "@/hooks";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      await login(username, password);
      navigate("/sessions");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      if (typeof window !== "undefined") {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <Card.Header>
        <Card.Title className="text-2xl text-center">Admin Login</Card.Title>
        <Card.Description className="text-center">
          Access the GSAP Playground Edit Mode
        </Card.Description>
      </Card.Header>
      <Form onSubmit={handleLogin}>
        <Card.Content>
          <TextField name="username">
            <Label>Username</Label>
            <Input required placeholder="Enter your username" />
            <FieldError>Please enter a valid email address</FieldError>
          </TextField>
          <TextField name="password">
            <Label>Password</Label>
            <Input required type="password" placeholder="Enter your password" />
          </TextField>
        </Card.Content>
        <Card.Footer className="mt-4">
          <Button
            isPending={loading}
            variant="primary"
            type="submit"
            className="w-full"
          >
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : null}
                Sign In
              </>
            )}
          </Button>
        </Card.Footer>
      </Form>
    </Card>
  );
}

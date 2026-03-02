import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link as HeroLink,
  Button,
} from "@heroui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <HeroNavbar maxWidth="xl">
      <NavbarBrand>
        <Link to="/" className="font-bold text-inherit">
          GSAP Learning
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link to="/sessions" className="text-foreground">
            Sessions
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          {user ? (
            <Button onClick={() => void logout()} color="danger" variant="flat">
              Logout
            </Button>
          ) : (
            <HeroLink as={Link} to="/login" color="primary">
              Login
            </HeroLink>
          )}
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}

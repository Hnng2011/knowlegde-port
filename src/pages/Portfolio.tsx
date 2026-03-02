import { Link } from "react-router-dom";
import { Button } from "@heroui/react";

export default function Portfolio() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center max-w-3xl mx-auto py-12 px-4 gap-8">
      <div className="flex flex-col gap-4 relative">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          GSAP Learning Journal
        </h1>
        <p className="text-xl md:text-2xl text-default-600 font-medium">
          An interactive portfolio showcasing my journey mastering React and
          GreenSock Animation Platform.
        </p>
      </div>

      <div className="text-left bg-default-50 border border-default-200 p-6 md:p-8 rounded-2xl shadow-sm w-full leading-relaxed mt-4">
        <h2 className="text-2xl font-bold mb-4">About this project</h2>
        <p className="mb-4 text-default-700">
          Unlike a traditional portfolio that only shows polished final results,
          this site serves as a living, breathing code journal. It documents the
          evolution of my understanding of complex web animations.
        </p>
        <p className="text-default-700">
          As a guest, you can explore public sandbox sessions, review the exact
          code written during that session, and see a live preview of the
          animations running directly in your browser.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          as={Link}
          to="/sessions"
          color="primary"
          size="lg"
          className="font-bold px-8 shadow-md"
        >
          Explore Sessions
        </Button>
        <Button
          as={Link}
          to="/login"
          variant="flat"
          color="default"
          size="lg"
          className="font-medium px-8"
        >
          Admin Login
        </Button>
      </div>
    </div>
  );
}

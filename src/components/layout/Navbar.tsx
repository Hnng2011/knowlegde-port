import TypewriterHover from "../core/TypingText";

export default function Navbar() {
  return (
    <nav className="flex gap-4 container mx-auto">
      <TypewriterHover content="Home" fontSizeClassName="text-xl" />
      <TypewriterHover content="Project" fontSizeClassName="text-xl" />
      <TypewriterHover content="About" fontSizeClassName="text-xl" />
      <TypewriterHover content="Contact" fontSizeClassName="text-xl" />
    </nav>
  );
}

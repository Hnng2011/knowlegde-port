import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md"
    ></motion.nav>
  );
}

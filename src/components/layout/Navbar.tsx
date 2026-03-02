import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

// Định nghĩa animation cho các item trên Nav
const navItemVariants = {
  hidden: { y: -10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand/Logo */}
        <motion.div
          variants={navItemVariants as any}
          className="flex flex-1 items-center"
        >
          <Link to="/" className="group text-xl font-bold tracking-tight">
            GSAP{" "}
            <span className="text-blue-500 transition-colors group-hover:text-blue-400">
              Learning
            </span>
          </Link>
        </motion.div>

        {/* Center: Navigation Links */}
        <motion.div
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }, // Tạo hiệu ứng rơi lần lượt
          }}
          className="hidden sm:flex gap-8 items-center"
        >
          <motion.div variants={navItemVariants as any}>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                `relative text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-white" : "text-white/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Sessions
                  {/* Thanh gạch chân animation khi active */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-blue-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        </motion.div>

        {/* Right: Auth Actions */}
        <motion.div
          variants={navItemVariants as any}
          className="flex flex-1 items-center justify-end gap-4"
        >
          {user ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void logout()}
              className="rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
            >
              Logout
            </motion.button>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Login
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
}

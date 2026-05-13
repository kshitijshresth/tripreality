import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const nav = useNavigate();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-20 w-[min(96%,1100px)]"
      data-testid="main-nav"
    >
      <div className="liquid-glass flex items-center justify-between pl-5 pr-2 py-2">
        <button
          onClick={() => nav("/")}
          className="flex items-center gap-2 text-white"
          data-testid="brand-button"
        >
          <Globe className="w-5 h-5 text-teal-300" strokeWidth={1.6} />
          <span className="font-semibold tracking-tight">TripReality</span>
        </button>

        <div className="hidden md:flex items-center gap-7 text-sm text-white/70">
          <a href="#features" className="uline" data-testid="nav-features">Features</a>
          <a href="#how" className="uline" data-testid="nav-how">How it Works</a>
          <a href="#cities" className="uline" data-testid="nav-cities">Destinations</a>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex px-4 py-2 text-sm text-white/80 hover:text-white"
            data-testid="signin-button"
          >Sign in</button>
          <button
            onClick={() => nav("/app")}
            className="liquid-glass px-4 py-2 text-sm text-white"
            data-testid="try-free-button"
          >
            Try for Free
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

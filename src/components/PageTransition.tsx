import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fade/slide between routes. "in" pages only animate on entry, "out" pages
 * only on exit, so moving between booth-interior screens doesn't flash the
 * shared chrome.
 */
export default function PageTransition({ children, mode = "both" }: { children: ReactNode; mode?: "both" | "in" | "out" | "none" }) {
  const reduce = useReducedMotion();
  if (mode === "none") return <div className="h-full w-full">{children}</div>;
  const still = { opacity: 1, y: 0 };
  return (
    <motion.div
      className="h-full w-full"
      initial={mode === "out" ? still : { opacity: 0, y: 8 }}
      animate={still}
      exit={mode === "in" ? still : { opacity: 0, y: -8 }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

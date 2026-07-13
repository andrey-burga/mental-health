import React, { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },

  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },

  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.main>
  );
}

export default PageTransition;
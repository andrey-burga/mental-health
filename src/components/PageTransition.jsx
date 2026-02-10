import { motion } from "framer-motion";

function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0.96 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.96 }}
      transition={{
        duration: 0.6,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.main>
  );
}

export default PageTransition;

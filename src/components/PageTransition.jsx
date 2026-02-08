import { motion } from "framer-motion";

function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}

export default PageTransition;

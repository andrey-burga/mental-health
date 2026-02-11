import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function NotFound() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="min-h-[70vh] flex items-center justify-center px-6 text-center"
    >
      <div className="max-w-xl">
        <h1 className="text-6xl font-bold text-primary mb-6">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-heading mb-4">
          Parece que esta página no existe
        </h2>

        <p className="text-body mb-8 leading-relaxed">
          A veces nos sentimos un poco perdidos…  
          pero siempre podemos volver al camino.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-full bg-primary text-white font-medium hover:opacity-90 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </motion.section>
  );
}

export default NotFound;

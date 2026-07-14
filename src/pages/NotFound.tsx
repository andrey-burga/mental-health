import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, type Variants } from "framer-motion";

// Variantes para animar los elementos en cascada de forma elegante
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16 }
  },
};

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-gray-100 transition-colors duration-300 overflow-hidden relative">

      {/* Orbe decorativo unificado (Reemplaza bg-primary) */}
      <div className="absolute top-1/3 left-1/2 -tranneutral-x-1/2 -tranneutral-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      <Header />

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center px-6 relative z-10 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl text-center space-y-8"
        >
          {/* El número 404 alineado a la paleta Índigo/Violeta */}
          <motion.div variants={itemVariants} className="relative inline-block">
            <h1
              className="
                text-8xl sm:text-9xl 
                font-black 
                tracking-tighter 
                text-transparent 
                bg-clip-text 
                bg-gradient-to-r 
                from-indigo-600 
                to-violet-600
                dark:from-indigo-400
                dark:to-violet-400
                select-none
              "
            >
              404
            </h1>

            {/* Efecto Glow detrás del número */}
            <div
              className="
                absolute 
                -inset-2 
                rounded-full 
                bg-gradient-to-r 
                from-indigo-500 
                to-violet-500
                opacity-20
                dark:opacity-30
                blur-2xl 
                animate-pulse 
                -z-10
              "
            />
          </motion.div>

          {/* Textos Informativos */}
          <div className="space-y-3">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight"
            >
              Parece que esta página no existe
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-md mx-auto"
            >
              A veces nos sentimos un poco perdidos… <br className="hidden sm:inline" />
              pero siempre podemos volver al camino.
            </motion.p>
          </div>

          {/* Botón interactivo premium */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-2"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 transition-all duration-150"
            >
              Volver al inicio
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;
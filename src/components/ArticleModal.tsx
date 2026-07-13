import React from "react";
import { motion } from "framer-motion";

interface Article {
  title: string;
  category: string;
  content?: string;
  excerpt?: string;
}

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

function ArticleModal({ article, onClose }: ArticleModalProps) {
  if (!article) return null;

  return (
    // Quitamos AnimatePresence de aquí adentro para que las animaciones "exit" funcionen al 100% controladas desde el padre.
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Cierra el modal si haces clic fuera de la tarjeta
    >
      <motion.div
        className="relative max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-2xl"
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro de la tarjeta
      >
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-sans transition-colors outline-none"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
          {article.category}
        </span>

        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h2>

        {/* CONTENIDO TEXTO */}
        <div className="mt-6 space-y-4 text-gray-600 dark:text-gray-300 font-light leading-relaxed text-base sm:text-lg whitespace-pre-line border-t border-gray-50 dark:border-slate-800/60 pt-6">
          {article.content || article.excerpt}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ArticleModal;
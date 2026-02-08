import { motion, AnimatePresence } from "framer-motion";

function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="
            relative
            max-w-3xl
            w-full
            max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            bg-white
            p-8
          "
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          <span className="text-xs font-medium text-primary">
            {article.category}
          </span>

          <h2 className="mt-2 text-2xl font-semibold text-heading">
            {article.title}
          </h2>

          <div className="mt-6 space-y-4 text-gray-700 whitespace-pre-line">
            {article.content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ArticleModal;

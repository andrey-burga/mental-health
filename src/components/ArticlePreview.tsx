import React from "react";

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  category: string;
  onClick: () => void;
}

function ArticlePreview({ title, excerpt, category, onClick }: ArticlePreviewProps) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
        {category}
      </span>

      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed line-clamp-3">
        {excerpt}
      </p>

      <p className="mt-4 text-sm text-primary font-semibold flex items-center gap-1">
        Leer testimonio 
        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
      </p>
    </article>
  );
}

export default ArticlePreview;
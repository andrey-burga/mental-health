function ArticlePreview({ title, excerpt, category, onClick }) {
  return (
    <article
      onClick={onClick}
      className="
        cursor-pointer
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
        transition
        hover:shadow-md
      "
    >
      <span className="text-xs font-medium text-primary">
        {category}
      </span>

      <h3 className="mt-2 text-lg font-semibold text-heading">
        {title}
      </h3>

      <p className="mt-2 text-sm text-body line-clamp-3">
        {excerpt}
      </p>

      <p className="mt-4 text-sm text-primary font-medium">
        Leer artículo →
      </p>
    </article>
  );
}

export default ArticlePreview;

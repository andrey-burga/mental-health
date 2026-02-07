function ArticleCard({ title, description, date, datetime, category, author }) {
  return (
    <article
      className="
        flex flex-col justify-between
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
        transition
        hover:shadow-md
      "
    >
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <time dateTime={datetime}>{date}</time>
        <span className="rounded-full bg-neutral-secondary-soft px-3 py-1 font-medium">
          {category}
        </span>
      </div>

      <div className="grow">
        <h3 className="text-lg font-semibold text-heading mb-2">
          {title}
        </h3>
        <p className="text-sm text-body leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        {author.name} · {author.role}
      </div>
    </article>
  );
}

export default ArticleCard;

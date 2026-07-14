interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  datetime: string;
  category: string;
  author: {
    name: string;
    role: string;
  };
}

function ArticleCard({
  title,
  description,
  date,
  datetime,
  category,
  author,
}: ArticleCardProps) {
  return (
    <article
      className="
        flex flex-col justify-between
        rounded-2xl
        border border-neutral-200
        bg-white
        p-6
        shadow-sm
        transition
        hover:shadow-md
        dark:border-neutral-800
        dark:bg-neutral-900
      "
    >
      <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
        <time dateTime={datetime}>{date}</time>

        <span
          className="
            rounded-full
            bg-indigo-100
            px-3
            py-1
            font-medium
            text-indigo-700
            dark:bg-indigo-950
            dark:text-indigo-300
          "
        >
          {category}
        </span>
      </div>

      <div className="grow">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 line-clamp-3">
          {description}
        </p>
      </div>

      <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        {author.name} · {author.role}
      </div>
    </article>
  );
}

export default ArticleCard;
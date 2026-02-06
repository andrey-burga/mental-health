function ResourceCard({ title, description, children, icon: Icon }) {
  return (
    <article
      aria-labelledby={`resource-${title}`}
      className="
        group
        flex flex-col justify-between
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
        transition-all duration-200
        hover:bg-neutral-secondary-medium
        hover:shadow-md
        focus-within:ring-2 focus-within:ring-primary
      "
    >
      <div>
        {Icon && (
          <div className="mb-4 flex justify-center text-primary">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        )}

        <h3
          id={`resource-${title}`}
          className="
            mb-3
            text-xl font-semibold
            tracking-tight
            text-heading
          "
        >
          {title}
        </h3>

        <p className="text-body leading-relaxed text-sm">{description}</p>
      </div>

      {children && <div className="mt-6">{children}</div>}
    </article>
  );
}

export default ResourceCard;

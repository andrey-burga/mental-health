function StatsCard({ count, title, description }) {
  return (
    <article
      className="
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
      "
    >
      <p className="text-3xl font-semibold text-primary mb-2">
        {count}
      </p>

      <h3 className="text-lg font-semibold text-heading mb-2">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-body">
        {description}
      </p>
    </article>
  );
}

export default StatsCard;

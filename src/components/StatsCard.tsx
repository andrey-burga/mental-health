import React from "react";

interface StatsCardProps {
  count: string | number;
  title: string;
  description: string;
}

function StatsCard({ count, title, description }: StatsCardProps) {
  return (
    <article
      className="
        rounded-2xl
        border border-neutral-200
        bg-white
        p-6
        shadow-sm
        transition-shadow duration-300
        hover:shadow-md
        dark:border-neutral-800
        dark:bg-neutral-900
      "
    >
      <p className="text-4xl font-extrabold text-indigo-600 mb-2">
        {count}
      </p>

      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
    </article>
  );
}

export default StatsCard;
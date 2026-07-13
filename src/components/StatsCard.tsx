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
        border border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-shadow duration-300
        hover:shadow-md
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <p className="text-4xl font-extrabold text-indigo-600 mb-2">
        {count}
      </p>

      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </article>
  );
}

export default StatsCard;
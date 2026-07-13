import React, { ReactNode, ComponentType } from "react";

interface ResourceCardProps {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: string }>;
}

function ResourceCard({ title, description, children, icon: Icon }: ResourceCardProps) {
  return (
    <article
      aria-labelledby={`resource-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className="
        group flex flex-col justify-between
        rounded-2xl
        border border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-md
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div>
        {Icon && (
          <div
            className="
              mb-4 flex items-center justify-center
              w-12 h-12
              rounded-xl
              bg-indigo-100
              text-indigo-600
              transition-colors
              group-hover:bg-indigo-600
              group-hover:text-white
              dark:bg-indigo-950
              dark:text-indigo-400
            "
          >
            <Icon className="h-full w-full" aria-hidden="true" />
          </div>
        )}

        <h3
          id={`resource-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="
            mb-2
            text-xl
            font-bold
            tracking-tight
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            text-sm
            leading-relaxed
            text-slate-700
            dark:text-slate-300
          "
        >
          {description}
        </p>
      </div>

      {children && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {children}
        </div>
      )}
    </article>
  );
}

export default ResourceCard;
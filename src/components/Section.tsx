import React, { ReactNode, ElementType } from "react";

interface SectionProps {
  title?: string;
  children: ReactNode;
  as?: ElementType; // Permite pasar "h1", "h2", "h3", etc.
}

function Section({ title, children, as: Heading = "h2" }: SectionProps) {
  return (
    <section className="w-full px-6 sm:px-8 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {title && (
          <Heading className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-6 tracking-tight">
            {title}
          </Heading>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
function Section({ title, children }) {
  return (
    <section className="px-8 pt-4 pb-0">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

export default Section;

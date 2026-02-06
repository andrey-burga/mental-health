function Section({ title, children, as: Heading = "h2" }) {
  return (
    <section className="px-8 pt-6 pb-2">
      {title && (
        <Heading className="font-semibold text-3xl mb-4">
          {title}
        </Heading>
      )}
      {children}
    </section>
  );
}

export default Section;

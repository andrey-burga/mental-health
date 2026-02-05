function ResourceCard({ title, description }) {
  return (
    <article className="flex-1 basis-[220px] text-center">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default ResourceCard

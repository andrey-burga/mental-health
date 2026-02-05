function ResourceCard({ title, description }) {
  return (
    <article className="flex-1 basis-[220px] text-center">
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="mt-5">{description}</p>
    </article>
  )
}

export default ResourceCard

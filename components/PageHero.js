export default function PageHero({ title, description, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="page-hero__eyebrow">The Tour Bees</p>
        <h1>{title}</h1>
        {description && <p className="page-hero__lede">{description}</p>}
        {children && <div className="page-hero__actions">{children}</div>}
      </div>
    </section>
  );
}

// Stand-in for pages that are built in later phases (see master_plan.md).
export default function PagePlaceholder({ title, description }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="page-hero__eyebrow">{`The Tour Bees`}</p>
        <h1>{title}</h1>
        {description && <p className="page-hero__lede">{description}</p>}
        <p className="page-hero__soon">This page is coming soon.</p>
      </div>
    </section>
  );
}

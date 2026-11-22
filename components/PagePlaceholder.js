import AccentTitle from "./AccentTitle";

// Stand-in for pages that are built in later phases (see master_plan.md).
export default function PagePlaceholder({ title, description }) {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="badge"><span className="badge__dot" />The Tour Bees</span>
        <h1><AccentTitle text={title} /></h1>
        {description && <p className="page-hero__lede">{description}</p>}
        <p className="page-hero__soon">This page is coming soon.</p>
      </div>
    </section>
  );
}

import AccentTitle from "./AccentTitle";

export default function PageHero({ title, description, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="badge">
          <span className="badge__dot" />
          The Tour Bees
        </span>
        <h1>
          <AccentTitle text={title} />
        </h1>
        {description && <p className="page-hero__lede">{description}</p>}
        {children && <div className="page-hero__actions">{children}</div>}
      </div>
    </section>
  );
}

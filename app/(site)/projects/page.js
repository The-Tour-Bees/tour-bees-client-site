import PageHero from "../../../components/PageHero";
import { PROJECTS } from "../../../lib/projects";

export const metadata = {
  title: "Other's Project",
  description: "Other projects from The Tour Bees team.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero title="Other's Project" description="More from the team behind The Tour Bees." />

      <section className="section">
        <div className="container">
          {PROJECTS.length === 0 ? (
            <p className="empty">Projects are coming soon.</p>
          ) : (
            <div className="grid grid--3">
              {PROJECTS.map((p) => (
                <article key={p.name} className="card project">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="project__img" src={p.image} alt="" loading="lazy" />
                  )}
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="project__link">
                      Visit project →
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

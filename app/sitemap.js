import { listEventSlugs } from "../lib/events";
import { ROUTES } from "../lib/nav";
import { SITE } from "../lib/site";

export default async function sitemap() {
  const eventRoutes = (await listEventSlugs()).map((slug) => `/events/${slug}`);

  return [...ROUTES, ...eventRoutes].map((route) => ({
    url: `${SITE.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));
}

import { listEventSlugs } from "../lib/events";
import { listTripPaths } from "../lib/trips";
import { ROUTES } from "../lib/nav";
import { SITE } from "../lib/site";

export default async function sitemap() {
  const eventRoutes = (await listEventSlugs()).map((slug) => `/events/${slug}`);

  const tripRoutes = await listTripPaths();

  return [...ROUTES, ...eventRoutes, ...tripRoutes].map((route) => ({
    url: `${SITE.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));
}

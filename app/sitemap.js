import { listEventSlugs } from "../lib/events";
import { listStayPaths } from "../lib/stays";
import { listTripPaths } from "../lib/trips";
import { ROUTES } from "../lib/nav";
import { SITE } from "../lib/site";

export default async function sitemap() {
  const eventRoutes = (await listEventSlugs()).map((slug) => `/events/${slug}`);

  const tripRoutes = await listTripPaths();
  const stayRoutes = await listStayPaths();

  return [...ROUTES, ...eventRoutes, ...tripRoutes, ...stayRoutes].map((route) => ({
    url: `${SITE.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));
}

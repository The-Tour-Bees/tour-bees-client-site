import { ROUTES } from "../lib/nav";
import { SITE } from "../lib/site";

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));
}

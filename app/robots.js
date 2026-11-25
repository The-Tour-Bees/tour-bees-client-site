import { SITE } from "../lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/login", "/forgot-password"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

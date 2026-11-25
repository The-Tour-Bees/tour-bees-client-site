export const SITE = {
  name: "The Tour Bees",
  url: "https://thetourbees.com",
  tagline: "Tour For Life",
  description:
    "Hand-picked events, customized trips, hotel, resort and houseboat stays. The Tour Bees — Tour For Life.",
  // Shown in the footer as "Developed By ...". Leave empty to hide it until the name is confirmed.
  developer: "",
  // Contact details shown on the Contact page. Empty values are hidden until filled in.
  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  },
};

// Default share image (Open Graph and Twitter). Rebuild it with: node scripts/og/make-og.mjs
export const OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` };

// Spread into a page's metadata to share its own picture instead of the default. Next replaces the
// whole openGraph and twitter objects, so both are written out here. Without a picture it adds
// nothing, and the root layout's defaults apply.
export function shareImage(url) {
  if (!url) return {};
  return {
    openGraph: { type: "website", siteName: SITE.name, locale: "en_US", images: [url] },
    twitter: { card: "summary_large_image", images: [url] },
  };
}

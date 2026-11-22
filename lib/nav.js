// Single source of truth for the header, footer and sitemap.xml.

export const NAV = [
  { label: "Home", href: "/" },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Previous", href: "/events/previous" },
      { label: "Ongoing", href: "/events/ongoing" },
      { label: "Upcoming", href: "/events/upcoming" },
    ],
  },
  {
    label: "Customized Trip",
    href: "/custom-trip",
    children: [
      { label: "Domestic", href: "/custom-trip/domestic" },
      { label: "International", href: "/custom-trip/international" },
    ],
  },
  { label: "Hotel / Resort", href: "/hotels" },
  { label: "Houseboat", href: "/houseboats" },
  { label: "Be a VIP Member", href: "/vip" },
  {
    label: "More",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Be an Investor", href: "/investor" },
      { label: "EMI System", href: "/emi" },
      { label: "Other's Project", href: "/projects" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export const FOOTER_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Booking Conditions", href: "/booking-conditions" },
];

// Every public route, used for sitemap.xml.
export const ROUTES = [
  "/",
  "/about",
  "/events",
  "/events/previous",
  "/events/ongoing",
  "/events/upcoming",
  "/vip",
  "/investor",
  "/emi",
  "/custom-trip",
  "/custom-trip/domestic",
  "/custom-trip/international",
  "/hotels",
  "/houseboats",
  "/contact",
  "/projects",
  "/booking-conditions",
];

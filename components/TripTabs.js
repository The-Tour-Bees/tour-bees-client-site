import Link from "next/link";

const TABS = [
  { key: "all", label: "Overview", href: "/custom-trip" },
  { key: "domestic", label: "Domestic", href: "/custom-trip/domestic" },
  { key: "international", label: "International", href: "/custom-trip/international" },
];

export default function TripTabs({ active = "all" }) {
  return (
    <nav className="tabs-nav" aria-label="Trip lists">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={t.key === active ? "tabs-nav__link tabs-nav__link--on" : "tabs-nav__link"}
          aria-current={t.key === active ? "page" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";

const TABS = [
  { key: "all", label: "Overview", href: "/events" },
  { key: "upcoming", label: "Upcoming", href: "/events/upcoming" },
  { key: "ongoing", label: "Ongoing", href: "/events/ongoing" },
  { key: "previous", label: "Previous", href: "/events/previous" },
];

export default function EventTabs({ active = "all" }) {
  return (
    <nav className="tabs-nav" aria-label="Event lists">
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

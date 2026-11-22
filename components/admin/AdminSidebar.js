"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sendJson } from "../../lib/client/post";

const ROLE_LABEL = { admin: "Admin", host: "Host", agent: "Agent", member: "Member" };

const MENUS = {
  admin: [
    { label: "Overview", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Add new user", href: "/admin/users/new" },
    { label: "Profile", href: "/admin/profile" },
  ],
  host: [{ label: "Overview", href: "/admin" }, { label: "Profile", href: "/admin/profile" }],
  agent: [{ label: "Overview", href: "/admin" }, { label: "Profile", href: "/admin/profile" }],
  member: [{ label: "Overview", href: "/admin" }, { label: "Profile", href: "/admin/profile" }],
};

export default function AdminSidebar({ role, name }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = MENUS[role] ?? MENUS.member;
  const active = items.reduce((best, i) => ((pathname === i.href || pathname.startsWith(`${i.href}/`)) && i.href.length > (best?.length ?? 0) ? i.href : best), null);

  async function signOut() {
    await sendJson("/api/auth/logout", {});
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="admin-side">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" />
        <span>The Tour Bees</span>
      </Link>
      <span className="admin-side__role">{ROLE_LABEL[role] ?? role}</span>
      <nav className="admin-side__nav" aria-label="Admin">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={i.href === active ? "admin-side__link admin-side__link--on" : "admin-side__link"} aria-current={i.href === active ? "page" : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="admin-side__user">
        <span className="admin-side__avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <div>
          <div className="admin-side__name">{name}</div>
          <button type="button" className="admin-side__signout" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </aside>
  );
}

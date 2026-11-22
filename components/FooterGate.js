"use client";

import { usePathname } from "next/navigation";

// The public footer is not shown inside the admin area.
export default function FooterGate({ children }) {
  return usePathname().startsWith("/admin") ? null : children;
}

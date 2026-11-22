import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

// Rejects a request that was sent from another website. SameSite cookies already help; this is the second check.
export function sameOriginError(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (new URL(origin).host === host) return null;
  } catch {}
  return NextResponse.json({ error: "Request blocked." }, { status: 403 });
}

// For route handlers. Returns { user } or { error } to send back.
export async function apiUser(roles) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  if (roles && !roles.includes(user.accountType)) {
    return { error: NextResponse.json({ error: "You do not have access to this." }, { status: 403 }) };
  }
  return { user };
}

// For server components. Sends visitors to the sign-in page or back to their dashboard.
export async function requireUserPage({ roles, allowForced = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword && !allowForced) redirect("/admin/profile?forced=1");
  if (roles && !roles.includes(user.accountType)) redirect("/admin");
  return user;
}

import { redirect } from "next/navigation";
import LoginForm from "../../../components/auth/LoginForm";
import AccentTitle from "../../../components/AccentTitle";
import { authConfigured, getCurrentUser } from "../../../lib/auth/session";

export const metadata = { title: "Sign in", description: "Sign in to The Tour Bees for hosts, agents and members.", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");

  return (
    <section className="auth-page">
      <h1><AccentTitle text="Sign in" /></h1>
      <p className="auth-page__lede">For our hosts, agents and members.</p>
      {authConfigured() ? (
        <div className="auth-card"><LoginForm /></div>
      ) : (
        <p className="auth-card auth-card--note">Sign-in is not set up yet. Please check back soon.</p>
      )}
    </section>
  );
}

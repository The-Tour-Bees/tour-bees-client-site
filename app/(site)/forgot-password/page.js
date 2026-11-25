import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm";
import AccentTitle from "../../../components/AccentTitle";
import { authConfigured } from "../../../lib/auth/session";

export const metadata = { title: "Reset your password", description: "Reset your Tour Bees password.", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <section className="auth-page">
      <h1><AccentTitle text="Reset password" /></h1>
      <p className="auth-page__lede">We will send a one-time code to your mobile.</p>
      {authConfigured() ? (
        <div className="auth-card"><ForgotPasswordForm /></div>
      ) : (
        <p className="auth-card auth-card--note">Password reset is not set up yet. Please check back soon.</p>
      )}
    </section>
  );
}

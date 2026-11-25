// Cloudflare Turnstile check for the public forms. Active only when TURNSTILE_SECRET_KEY is set.
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const TURNSTILE_FIELD = "cf-turnstile-response"; // the field name the widget adds to a form
export const TURNSTILE_FAILED = "Please complete the verification check and try again.";

let warned = false;

// True when the request may go ahead. If Cloudflare cannot be reached, the request is refused.
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warned) {
      console.warn("TURNSTILE_SECRET_KEY is not set: form submissions are not checked by Turnstile.");
      warned = true;
    }
    return true;
  }
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data.success !== true) console.warn("Turnstile rejected a submission:", data["error-codes"]?.join(", "));
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err.message);
    return false;
  }
}

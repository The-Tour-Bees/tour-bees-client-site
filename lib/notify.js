export class NotifyUnavailable extends Error {}

const headers = () => ({
  "Content-Type": "application/json",
  ...(process.env.NOTIFY_WEBHOOK_TOKEN && { Authorization: `Bearer ${process.env.NOTIFY_WEBHOOK_TOKEN}` }),
});

// Sends an SMS or email through any gateway that accepts a JSON webhook:
//   NOTIFY_WEBHOOK_URL   POST { channel: "sms" | "email", to, message }
//   NOTIFY_WEBHOOK_TOKEN optional, sent as a Bearer token
// In development, with no webhook set, the message is printed to the server console instead.
export async function deliver({ channel = "sms", to, message }) {
  const url = process.env.NOTIFY_WEBHOOK_URL;

  if (url) {
    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ channel, to, message }),
    }).catch(() => null);
    if (!res?.ok) throw new NotifyUnavailable("The message provider did not accept the message");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[notify:${channel}] to ${to}: ${message}`);
    return;
  }
  throw new NotifyUnavailable("No message provider is configured");
}

const EVENT_TIMEOUT_MS = 3000;

// Tells the team about a new booking or enquiry, on the same webhook as above:
//   POST { type: "booking" | "enquiry", id, name, contact: { mobile, email }, item, date }
// Does nothing without NOTIFY_WEBHOOK_URL, and never throws: the guest's request has already succeeded.
export async function notifyTeam({ type, id, name, contact, item, date = new Date() }) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ type, id, name, contact, item, date: date.toISOString() }),
      signal: AbortSignal.timeout(EVENT_TIMEOUT_MS),
    });
    if (!res.ok) console.error(`Notification for ${type} ${id} was refused: HTTP ${res.status}`);
  } catch (err) {
    console.error(`Notification for ${type} ${id} failed: ${err.message}`);
  }
}

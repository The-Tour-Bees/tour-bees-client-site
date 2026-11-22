export class NotifyUnavailable extends Error {}

// Sends an SMS or email through any gateway that accepts a JSON webhook:
//   NOTIFY_WEBHOOK_URL   POST { channel: "sms" | "email", to, message }
//   NOTIFY_WEBHOOK_TOKEN optional, sent as a Bearer token
// In development, with no webhook set, the message is printed to the server console instead.
export async function deliver({ channel = "sms", to, message }) {
  const url = process.env.NOTIFY_WEBHOOK_URL;

  if (url) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NOTIFY_WEBHOOK_TOKEN && { Authorization: `Bearer ${process.env.NOTIFY_WEBHOOK_TOKEN}` }),
      },
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

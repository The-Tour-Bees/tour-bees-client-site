import { json } from "../../../../lib/auth/api";
import { sameOriginError } from "../../../../lib/auth/guard";
import { endSession } from "../../../../lib/auth/session";
import { GENERAL_PER_MINUTE, rateLimit } from "../../../../lib/rate-limit";

export async function POST(request) {
  const limited = rateLimit(request, "auth/logout", GENERAL_PER_MINUTE);
  if (limited) return limited;

  const blocked = sameOriginError(request);
  if (blocked) return blocked;
  await endSession();
  return json({ ok: true });
}

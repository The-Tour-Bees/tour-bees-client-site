import { json } from "../../../../lib/auth/api";
import { sameOriginError } from "../../../../lib/auth/guard";
import { endSession } from "../../../../lib/auth/session";

export async function POST(request) {
  const blocked = sameOriginError(request);
  if (blocked) return blocked;
  await endSession();
  return json({ ok: true });
}

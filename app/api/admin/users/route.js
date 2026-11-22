import { z } from "zod";
import User from "../../../../models/User";
import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { generateTempPassword, hashPassword, normalizeMobile } from "../../../../lib/auth/password";
import { deliver } from "../../../../lib/notify";

export const dynamic = "force-dynamic";

const text = (max) => z.string().trim().max(max);
const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")]).default("");

const createSchema = z
  .object({
    accountType: z.enum(["host", "agent", "member"]),
    fullName: text(120).min(2, "Please enter the full name"),
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/, "3 to 30 letters, numbers, dot, dash or underscore"),
    email: z.email("Enter a valid email address").transform((v) => v.toLowerCase()),
    mobile: z.string().transform(normalizeMobile).pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number")),
    bloodGroup: z.enum(["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).default(""),
    dateOfBirth: date,
    nidNumber: text(30).default(""),
    presentAddress: text(300).default(""),
    emergencyContact: text(30).default(""),
    commissionPercent: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(0).max(100).optional()),
    payoutNumber: text(30).default(""),
    tier: z.enum(["regular", "vip"]).default("regular"),
    expiresAt: date,
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .refine((d) => d.accountType !== "agent" || d.commissionPercent != null, {
    path: ["commissionPercent"],
    message: "Enter the agent's commission",
  });

const publicUser = (u) => ({
  id: String(u._id),
  accountType: u.accountType,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  mobile: u.mobile,
  status: u.status,
  approvalStatus: u.approvalStatus,
  createdAt: u.createdAt,
});

export async function GET(request) {
  try {
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filter = {};
    for (const key of ["accountType", "approvalStatus", "status"]) {
      const v = searchParams.get(key);
      if (v) filter[key] = v;
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    return json({ users: users.map(publicUser) });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request) {
  try {
    const { data, response } = await begin(request, createSchema);
    if (response) return response;

    const { user: admin, error } = await apiUser(["admin"]);
    if (error) return error;

    const temporaryPassword = generateTempPassword();
    let user;
    try {
      user = await User.create({
        accountType: data.accountType,
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        mobile: data.mobile,
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
        bloodGroup: data.bloodGroup,
        dateOfBirth: data.dateOfBirth,
        nidNumber: data.nidNumber,
        presentAddress: data.presentAddress,
        emergencyContact: data.emergencyContact,
        status: data.status,
        approvalStatus: "pending",
        ...(data.accountType === "agent" && { agent: { commissionPercent: data.commissionPercent, payoutNumber: data.payoutNumber } }),
        ...(data.accountType === "member" && { member: { tier: data.tier, expiresAt: data.expiresAt } }),
        createdBy: admin._id,
      });
    } catch (err) {
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0] ?? "username";
        return json({ error: "Please check the highlighted fields.", fieldErrors: { [field]: `That ${field} is already used` } }, 409);
      }
      throw err;
    }

    // The admin also sees the password once on screen, so a failed message is not fatal.
    const delivered = await deliver({
      channel: "sms",
      to: user.mobile,
      message: `Your Tour Bees account was created. Username: ${user.username}. Temporary password: ${temporaryPassword}. You can sign in after our team approves your account.`,
    })
      .then(() => true)
      .catch(() => false);

    return json({ user: publicUser(user), temporaryPassword, delivered }, 201);
  } catch (err) {
    return handleError(err);
  }
}

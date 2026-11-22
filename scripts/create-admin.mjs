// Creates the first admin account (there is no sign-up for admins).
//
//   ADMIN_NAME="Your Name" ADMIN_EMAIL=you@example.com ADMIN_MOBILE=+8801XXXXXXXXX \
//   ADMIN_USERNAME=admin ADMIN_PASSWORD='a long password' \
//   node --env-file=.env.local scripts/create-admin.mjs
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const need = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return v;
};

const uri = need("MONGODB_URI");
const password = need("ADMIN_PASSWORD");
if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

await mongoose.connect(uri);
const exists = await User.findOne({ accountType: "admin" });
if (exists) {
  console.log(`An admin already exists (${exists.email}). Nothing changed.`);
} else {
  await User.create({
    accountType: "admin",
    fullName: need("ADMIN_NAME"),
    username: need("ADMIN_USERNAME"),
    email: need("ADMIN_EMAIL"),
    mobile: need("ADMIN_MOBILE").replace(/[\s-]/g, ""),
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: false,
    status: "active",
    approvalStatus: "approved",
  });
  console.log("Admin created. Sign in at /login.");
}
await mongoose.disconnect();

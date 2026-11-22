import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Compared against when no account matches, so unknown and known accounts take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);
export const burnPasswordCheck = (plain) => bcrypt.compare(plain, DUMMY_HASH);

// No 0/O or 1/l/I, so a password read out loud or typed from a message is not misread.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateTempPassword(length = 12) {
  return Array.from({ length }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("");
}

export const normalizeMobile = (value) => String(value).replace(/[\s-]/g, "");

// "+8801712345678" -> "+88017••••678"
export const maskMobile = (mobile) => (mobile.length > 7 ? `${mobile.slice(0, 6)}••••${mobile.slice(-3)}` : "your mobile");

export const MIN_PASSWORD = 8;

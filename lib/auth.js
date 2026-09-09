import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sql } from "./db";

const COOKIE_NAME = "bookseller_session";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// Reads the session cookie and returns the current user row, or null.
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return null;
  }
  const rows = await sql`
    SELECT id, username, email, display_name, bio, avatar_url,
           bank_name, account_number, account_name, is_admin, status
    FROM users WHERE id = ${payload.uid}
  `;
  return rows[0] || null;
}

// Throws-free helper for API routes: returns user or null, and a 401 body if needed.
export async function requireUser() {
  const user = await getCurrentUser();
  return user;
}

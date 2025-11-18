import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?";
const DEFAULT_PASSWORD_LENGTH = 12;
const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? 10);

export function generateTempPassword(length = DEFAULT_PASSWORD_LENGTH) {
  const byteCount = Math.max(length, DEFAULT_PASSWORD_LENGTH);
  const bytes = randomBytes(byteCount);
  let password = "";

  for (let i = 0; i < length; i += 1) {
    const index = bytes[i] % PASSWORD_CHARS.length;
    password += PASSWORD_CHARS[index];
  }

  return password;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

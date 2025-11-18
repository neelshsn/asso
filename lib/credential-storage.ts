"use client";

export type CredentialType = "volunteer" | "association";

export type StoredCredentials = {
  type: CredentialType;
  login: string;
  password?: string;
  expiresAt: number;
};

const STORAGE_KEY = "ngo-last-credentials";
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function persistCredentials(
  payload: Omit<StoredCredentials, "expiresAt">,
  ttlMs = DEFAULT_TTL_MS,
) {
  if (typeof window === "undefined") return;
  try {
    const record: StoredCredentials = {
      ...payload,
      expiresAt: Date.now() + ttlMs,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Unable to persist credentials", error);
  }
}

export function readStoredCredentials() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCredentials;
    if (parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Unable to read credentials", error);
    return null;
  }
}

export function clearStoredCredentials() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

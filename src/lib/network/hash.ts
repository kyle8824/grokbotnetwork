import { createHash } from "node:crypto";
import { API_KEY_PREFIX } from "./constants";

const API_KEY_SALT = "agentwire-v1-apikey";

export function hashApiKey(key: string): string {
  return createHash("sha256")
    .update(`${key.trim()}:${API_KEY_SALT}`)
    .digest("hex");
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${API_KEY_PREFIX}${hex}`;
}

export function apiKeyPrefix(key: string): string {
  return key.trim().slice(0, 12);
}

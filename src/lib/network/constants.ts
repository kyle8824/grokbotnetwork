/** Client-safe constants. Never put key material here. */
export const API_KEY_PREFIX = "awk_live_";

/** Canonical published node. Curl examples in BOTS.md use this. */
export const LIVE_NODE = "https://grokbotnetwork.vercel.app";

export function looksLikeApiKey(value: string): boolean {
  const v = value.trim();
  return v.startsWith(API_KEY_PREFIX) && v.length >= 24;
}

/** Landing showcase — span of desks, not the publisher. */
export const FEATURED_HANDLES = [
  "grokbotnetwork",
  "fieldnotes",
  "runbook",
  "ticker",
  "vault",
  "stacktrace",
] as const;

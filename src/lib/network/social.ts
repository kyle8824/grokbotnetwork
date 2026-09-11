/** Client-safe X/Twitter URL helpers. */

const X_HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
const RESERVED = new Set([
  "home",
  "i",
  "intent",
  "share",
  "search",
  "explore",
  "compose",
  "messages",
  "notifications",
  "settings",
]);

export type XSocial = { url: string; handle: string };

export function parseXSocial(raw: string | null | undefined): XSocial | null {
  if (raw == null) return null;
  const v = raw.trim();
  if (!v) return null;
  let handle = "";
  try {
    if (/^https?:\/\//i.test(v)) {
      const u = new URL(v);
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      if (host !== "x.com" && host !== "twitter.com") return null;
      handle = (u.pathname.replace(/^\//, "").split("/")[0] ?? "").replace(/^@/, "");
    } else {
      handle = v.replace(/^@/, "");
      handle = handle.replace(/^(https?:\/\/)?(www\.)?(x|twitter)\.com\//i, "");
      handle = (handle.split(/[/?#]/)[0] ?? "").replace(/^@/, "");
    }
  } catch {
    return null;
  }
  if (!X_HANDLE_RE.test(handle)) return null;
  if (RESERVED.has(handle.toLowerCase())) return null;
  return { handle, url: `https://x.com/${handle}` };
}

export function xHandleFromUrl(url: string | null | undefined): string | null {
  return parseXSocial(url)?.handle ?? null;
}

export function parseXSocialOrThrow(raw: string): XSocial {
  const parsed = parseXSocial(raw);
  if (!parsed) throw new Error("X link must be an x.com / twitter.com URL or @handle.");
  return parsed;
}

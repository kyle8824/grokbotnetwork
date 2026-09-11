export function newId(prefix: string): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

export function storyIdFromSlug(slug: string): string {
  return `st_${slug.replace(/[^a-z0-9_-]/gi, "").slice(0, 80)}`;
}

export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 32);
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z][a-z0-9-]{1,31}$/.test(handle);
}

/** Browser client for the bot JSON API. Same auth as curl: Bearer token. */

export async function botFetch<T>(
  path: string,
  apiKey: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (apiKey) headers.set("authorization", `Bearer ${apiKey}`);
  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: unknown }).error)
        : text || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

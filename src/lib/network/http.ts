export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

/** Login for bots: Authorization: Bearer <api_key> or X-Api-Key. */
export function apiKeyFrom(request: Request): string | undefined {
  const x = request.headers.get("x-api-key")?.trim();
  if (x) return x;
  const auth = request.headers.get("authorization");
  if (!auth) return undefined;
  const bearer = auth.match(/^Bearer\s+(\S+)/i);
  return bearer?.[1]?.trim() || undefined;
}

export function fail(err: unknown, fallback = 400): Response {
  const message = err instanceof Error ? err.message : "Request failed";
  const lower = message.toLowerCase();
  let status = fallback;
  if (
    lower.includes("api key") ||
    lower.includes("unauthorized") ||
    lower.includes("not authenticated")
  ) {
    status = 401;
  } else if (lower.includes("forbidden") || lower.includes("not your agent")) {
    status = 403;
  } else if (lower.includes("not found") || lower.includes("unknown")) {
    status = 404;
  }
  return json({ error: message }, status);
}

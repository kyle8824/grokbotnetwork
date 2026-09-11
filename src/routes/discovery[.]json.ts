import { createFileRoute } from "@tanstack/react-router";
import { discoveryDocument, originFromRequest } from "@/lib/network/discovery";

const CANONICAL_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Authorization, Content-Type, X-Api-Key",
};

function discoveryResponse(request: Request): Response {
  const doc = discoveryDocument(originFromRequest(request));
  return new Response(JSON.stringify(doc, null, 2), {
    status: 200,
    headers: CANONICAL_HEADERS,
  });
}

export const Route = createFileRoute("/discovery.json")({
  server: {
    handlers: {
      GET: async ({ request }) => discoveryResponse(request),
      OPTIONS: async () => new Response(null, { status: 204, headers: CANONICAL_HEADERS }),
    },
  },
});

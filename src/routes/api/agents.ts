import { createFileRoute } from "@tanstack/react-router";
import { fail, json, readJson } from "@/lib/network/http";
import { createAgent, listAgents } from "@/lib/network/repo.server";

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export const Route = createFileRoute("/api/agents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const interest = new URL(request.url).searchParams.get("interest") ?? undefined;
        return json(await listAgents({ interest }));
      },
      POST: async ({ request }) => {
        try {
          const body = await readJson(request);
          const result = await createAgent({
            handle: String(body.handle ?? ""),
            displayName: String(body.displayName ?? body.display_name ?? ""),
            owner: String(body.owner ?? "Independent desk"),
            bio: String(body.bio ?? ""),
            personality: String(body.personality ?? ""),
            interests: asStringList(body.interests),
            sources: asStringList(body.sources),
            xUrl:
              body.xUrl === undefined && body.x_url === undefined && body.xHandle === undefined
                ? undefined
                : String(body.xUrl ?? body.x_url ?? body.xHandle ?? ""),
          });
          return json(result, 201);
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

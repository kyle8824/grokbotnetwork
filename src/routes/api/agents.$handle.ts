import { createFileRoute } from "@tanstack/react-router";
import { apiKeyFrom, fail, json, readJson } from "@/lib/network/http";
import {
  agentFromApiKey,
  getAgentByHandle,
  listActions,
  listFollows,
  listSignals,
  overlappingAgents,
  updateAgent,
} from "@/lib/network/repo.server";

function asStringList(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return undefined;
}

async function patchProfile(request: Request, handle: string) {
  const actor = await agentFromApiKey(apiKeyFrom(request));
  const body = await readJson(request);
  const agent = await updateAgent(actor, handle, {
    displayName: typeof body.displayName === "string" ? body.displayName : typeof body.display_name === "string" ? body.display_name : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    bio: typeof body.bio === "string" ? body.bio : undefined,
    personality: typeof body.personality === "string" ? body.personality : undefined,
    interests: asStringList(body.interests),
    sources: asStringList(body.sources),
    avatarUrl:
      body.avatarUrl === undefined && body.avatar_url === undefined
        ? undefined
        : body.avatarUrl === null || body.avatar_url === null
          ? null
          : String(body.avatarUrl ?? body.avatar_url ?? ""),
    xUrl:
      body.xUrl === undefined && body.x_url === undefined && body.xHandle === undefined
        ? undefined
        : body.xUrl === null || body.x_url === null
          ? null
          : String(body.xUrl ?? body.x_url ?? body.xHandle ?? ""),
  });
  return json(agent);
}

export const Route = createFileRoute("/api/agents/$handle")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const agent = await getAgentByHandle(params.handle);
        if (!agent) return json({ error: "Not found" }, 404);
        const [following, followers, overlap, signals, actions] = await Promise.all([
          listFollows({ fromAgentId: agent.id }),
          listFollows({ toAgentId: agent.id }),
          overlappingAgents(agent.id),
          listSignals({ authorAgentId: agent.id, limit: 40 }),
          listActions({ actorAgentId: agent.id, limit: 30 }),
        ]);
        return json({ agent, following, followers, overlap, signals, actions });
      },
      PATCH: async ({ request, params }) => {
        try {
          return await patchProfile(request, params.handle);
        } catch (err) {
          return fail(err);
        }
      },
      POST: async ({ request, params }) => {
        try {
          return await patchProfile(request, params.handle);
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

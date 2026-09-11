import { createFileRoute } from "@tanstack/react-router";
import { apiKeyFrom, fail, json, readJson } from "@/lib/network/http";
import { agentFromApiKey, followAgent, listFollows } from "@/lib/network/repo.server";
import type { FollowOp } from "@/lib/types";

function truthy(v: string | null): boolean {
  if (!v) return false;
  return v === "1" || v === "true" || v === "yes";
}

export const Route = createFileRoute("/api/follows")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return json(
          await listFollows({
            fromAgentId: url.searchParams.get("from") ?? undefined,
            toAgentId: url.searchParams.get("to") ?? undefined,
            xIntentOnly: truthy(url.searchParams.get("xIntent")),
          }),
        );
      },
      POST: async ({ request }) => {
        try {
          const actor = await agentFromApiKey(apiKeyFrom(request));
          const body = await readJson(request);
          const to = String(body.to ?? body.toHandle ?? body.to_handle ?? body.toAgentId ?? body.to_agent_id ?? "");
          const rawOp = String(body.op ?? body.action ?? "toggle");
          const op: FollowOp = rawOp === "follow" || rawOp === "unfollow" ? rawOp : "toggle";
          const alsoFollowOnX = Boolean(
            body.alsoFollowOnX ?? body.also_follow_on_x ?? body.xFollowIntent ?? body.x_follow_intent,
          );
          const res = await followAgent(actor, to, op, { alsoFollowOnX });
          return json(res);
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

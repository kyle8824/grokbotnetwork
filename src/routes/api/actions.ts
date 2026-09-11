import { createFileRoute } from "@tanstack/react-router";
import { apiKeyFrom, fail, json, readJson } from "@/lib/network/http";
import { agentFromApiKey, listActions, recordAction } from "@/lib/network/repo.server";
import type { SignalKind } from "@/lib/types";

export const Route = createFileRoute("/api/actions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return json(await listActions({ actorAgentId: url.searchParams.get("actor") ?? undefined }));
      },
      POST: async ({ request }) => {
        try {
          const actor = await agentFromApiKey(apiKeyFrom(request));
          const body = await readJson(request);
          const discuss =
            body.discuss && typeof body.discuss === "object"
              ? (body.discuss as {
                  headline: string;
                  summary: string;
                  kind: SignalKind;
                  confidence?: number;
                })
              : undefined;
          const res = await recordAction(actor, {
            kind: body.kind as "discuss" | "cite" | "boost",
            targetType: (body.targetType as "signal" | "story" | "agent") ?? "story",
            targetId: String(body.targetId ?? body.slug ?? ""),
            slug: typeof body.slug === "string" ? body.slug : undefined,
            note: body.note ? String(body.note) : undefined,
            citeUrl: body.citeUrl ? String(body.citeUrl) : null,
            discuss,
          });
          return json(res, 201);
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

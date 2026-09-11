import { createFileRoute } from "@tanstack/react-router";
import { apiKeyFrom, fail, json, readJson } from "@/lib/network/http";
import { agentFromApiKey, listSignals, postSignal } from "@/lib/network/repo.server";
import type { SignalKind } from "@/lib/types";

export const Route = createFileRoute("/api/signals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const kind = url.searchParams.get("kind") as SignalKind | null;
        return json(
          await listSignals({
            authorAgentId: url.searchParams.get("author") ?? undefined,
            storyId: url.searchParams.get("story") ?? undefined,
            kind: kind || undefined,
            topic: url.searchParams.get("topic") ?? undefined,
          }),
        );
      },
      POST: async ({ request }) => {
        try {
          const actor = await agentFromApiKey(apiKeyFrom(request));
          const body = await readJson(request);
          const signal = await postSignal(actor, {
            headline: String(body.headline ?? ""),
            summary: String(body.summary ?? ""),
            topic: body.topic ? String(body.topic) : undefined,
            confidence: typeof body.confidence === "number" ? body.confidence : undefined,
            sourceCount: typeof body.sourceCount === "number" ? body.sourceCount : undefined,
            perspectiveCount: typeof body.perspectiveCount === "number" ? body.perspectiveCount : undefined,
            storyId: body.storyId ? String(body.storyId) : null,
            storyUrl: body.storyUrl ? String(body.storyUrl) : null,
            kind: (body.kind as SignalKind) || "signal",
          });
          return json(signal, 201);
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

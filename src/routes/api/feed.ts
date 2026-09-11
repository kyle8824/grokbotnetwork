import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { listSignals } from "@/lib/network/repo.server";
import type { FeedFilter, SignalKind } from "@/lib/types";

export const Route = createFileRoute("/api/feed")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const filter = (url.searchParams.get("filter") === "following" ? "following" : "all") as FeedFilter;
        const kind = url.searchParams.get("kind") as SignalKind | null;
        return json(
          await listSignals({
            filter,
            viewerAgentId: url.searchParams.get("agent") ?? undefined,
            kind: kind || undefined,
            topic: url.searchParams.get("topic") ?? undefined,
          }),
        );
      },
    },
  },
});

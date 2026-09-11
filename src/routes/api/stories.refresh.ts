import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/network/http";
import { refreshStories } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/stories/refresh")({
  server: {
    handlers: {
      POST: async () => {
        try {
          return json(await refreshStories("manual"));
        } catch (err) {
          return fail(err, 502);
        }
      },
    },
  },
});

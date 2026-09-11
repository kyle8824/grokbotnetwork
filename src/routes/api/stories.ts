import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { listStories, refreshMeta } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/stories")({
  server: {
    handlers: {
      GET: async () => {
        const [stories, meta] = await Promise.all([listStories(), refreshMeta()]);
        return json({ stories, meta });
      },
    },
  },
});

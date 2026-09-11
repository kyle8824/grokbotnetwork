import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { getStoryDiscussion } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/stories/$slug/discussion")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const disc = await getStoryDiscussion(params.slug);
        if (!disc) return json({ error: "Not found" }, 404);
        return json(disc);
      },
    },
  },
});

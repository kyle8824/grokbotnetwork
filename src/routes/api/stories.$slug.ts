import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { getStoryBySlug } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/stories/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const story = await getStoryBySlug(params.slug);
        if (!story) return json({ error: "Not found" }, 404);
        return json(story);
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { canonicalOrigin, robotsTxt } from "@/lib/network/discovery";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(robotsTxt(canonicalOrigin()), {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
        }),
    },
  },
});

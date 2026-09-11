import { createFileRoute } from "@tanstack/react-router";
import { canonicalOrigin, llmsTxt } from "@/lib/network/discovery";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(llmsTxt(canonicalOrigin()), {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
            "access-control-allow-origin": "*",
          },
        }),
    },
  },
});

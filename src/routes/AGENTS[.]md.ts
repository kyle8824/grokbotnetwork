import { createFileRoute } from "@tanstack/react-router";

/** Alias of /BOTS.md — same protocol, machine-friendly path. */
export const Route = createFileRoute("/AGENTS.md")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 302,
          headers: {
            location: "/BOTS.md",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        }),
    },
  },
});

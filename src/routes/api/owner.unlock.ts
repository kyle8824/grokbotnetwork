import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";

export const Route = createFileRoute("/api/owner/unlock")({
  server: {
    handlers: {
      POST: async () =>
        json(
          {
            error: "Removed. Agent signup returns an API key; that key is login.",
            register: "POST /api/agents",
            whoami: "GET /api/me",
            docs: "/BOTS.md",
          },
          410,
        ),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { apiKeyFrom, fail, json } from "@/lib/network/http";
import { whoami } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return json(await whoami(apiKeyFrom(request)));
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});

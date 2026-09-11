import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { networkSnapshot } from "@/lib/network/repo.server";

export const Route = createFileRoute("/api/network")({
  server: {
    handlers: {
      GET: async () => json(await networkSnapshot()),
    },
  },
});

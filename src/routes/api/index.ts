import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { getApiIndex } from "@/lib/network/queries";

export const Route = createFileRoute("/api/")({
  server: {
    handlers: {
      GET: async () => json(await getApiIndex()),
    },
  },
});

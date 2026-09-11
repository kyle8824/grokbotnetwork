import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/network/http";
import { getSql } from "@/lib/db";
import { ensureSeeded } from "@/lib/network/seed.server";

export const Route = createFileRoute("/api/hives")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeeded();
        const sql = await getSql();
        const hives = await sql.query(
          `select id, name, objective, status, created_at from hives order by created_at desc`,
        );
        return json({
          version: "1.1-stub",
          message: "Hives coming next. Schema is live; runtime is V1.1.",
          layers: ["agents", "hives", "network"],
          hives,
        });
      },
    },
  },
});

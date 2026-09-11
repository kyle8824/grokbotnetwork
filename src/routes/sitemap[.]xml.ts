import { createFileRoute } from "@tanstack/react-router";
import { canonicalOrigin, sitemapXml } from "@/lib/network/discovery";
import { SEED_AGENTS } from "@/lib/network/seed-data";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const extra = SEED_AGENTS.map((a) => ({ path: `/agent/${a.handle}` }));
        return new Response(sitemapXml(canonicalOrigin(), extra), {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});

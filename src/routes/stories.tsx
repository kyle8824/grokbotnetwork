import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { listStoriesFn, refreshStoriesFn } from "@/lib/network/queries";
import { relativeTime, topicLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { V1Badge } from "@/components/v1-badge";

export const Route = createFileRoute("/stories")({
  loader: () => listStoriesFn(),
  component: StoriesPage,
});

function StoriesPage() {
  const { stories, meta } = Route.useLoaderData();
  const router = useRouter();

  async function refresh() {
    const toastId = toast.loading("Refreshing from Grok Bot News…");
    try {
      const res = await refreshStoriesFn();
      toast.success(
        res.fromLive
          ? `Ingested ${res.count} live stories from Grok Bot News`
          : `Using cached desk copy (${res.count} stories)`,
        { id: toastId },
      );
      await router.invalidate({ sync: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refresh failed", { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl">Stories</h1>
            <V1Badge />
          </div>
          <p className="max-w-2xl text-muted-foreground">
            Stories from{" "}
            <a className="text-accent hover:underline" href="https://www.grokbotnews.com" rel="noreferrer" target="_blank">
              Grok Bot News
            </a>
            , one publisher on this node. Other desks (research, ops, investing) SIGNAL on the feed without a
            story page. Seeded takes are labeled.
          </p>
          <p className="font-mono text-xs text-faint">
            Last refresh {meta.lastRefresh ? relativeTime(meta.lastRefresh) : "never"} · source {meta.source ?? "seed"}
          </p>
        </div>
        <Button onClick={refresh}>Refresh publisher</Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {stories.map((st) => (
          <Link key={st.id} to="/story/$slug" params={{ slug: st.slug }} className="block h-full">
            <Card className="flex h-full flex-col p-5 transition-colors hover:border-wire/40">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{topicLabel(st.topic)}</Badge>
                {st.isFallback ? <Badge variant="warn">Seeded cache</Badge> : <Badge variant="ok">Live ingest</Badge>}
              </div>
              <h2 className="mt-3 font-serif text-lg leading-snug">{st.title}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{st.summary}</p>
              <p className="mt-4 text-sm text-accent">See what the agents think →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

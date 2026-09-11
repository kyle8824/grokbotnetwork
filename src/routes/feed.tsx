import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { getFeedFn, listFollowsFn } from "@/lib/network/queries";
import { botFetch } from "@/lib/network/bot-client";
import { useActingDesk } from "@/lib/network/desk-store";
import type { FeedFilter, SignalKind } from "@/lib/types";
import { SignalCard } from "@/components/signal-card";
import { V1Badge } from "@/components/v1-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/feed")({
  validateSearch: (search: Record<string, unknown>): { filter?: FeedFilter; kind?: SignalKind } => ({
    filter: search.filter === "following" ? "following" : "all",
    kind: ["signal", "analysis", "source_check", "dissent"].includes(String(search.kind))
      ? (search.kind as SignalKind)
      : undefined,
  }),
  loader: async () => {
    const [signals, follows] = await Promise.all([
      getFeedFn({ data: { filter: "all" } }),
      listFollowsFn(),
    ]);
    return { signals, follows };
  },
  component: FeedPage,
});

function FeedPage() {
  const { signals, follows } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const acting = useActingDesk();
  const actingAgentId = acting?.id;
  const filter = search.filter ?? "all";

  const visible = useMemo(() => {
    let list = signals;
    if (search.kind) list = list.filter((s) => s.kind === search.kind);
    if (filter === "following" && actingAgentId) {
      const allowed = new Set(
        follows.filter((e) => e.fromAgentId === actingAgentId).map((e) => e.toAgentId),
      );
      allowed.add(actingAgentId);
      list = list.filter((s) => allowed.has(s.authorAgentId));
    }
    return list;
  }, [signals, follows, filter, actingAgentId, search.kind]);

  async function apply(next: FeedFilter) {
    await navigate({ search: { ...search, filter: next } });
  }

  async function boost(signalId: string) {
    if (!acting) {
      toast.error("Connect an API key in the console to boost.");
      return;
    }
    try {
      await botFetch("/api/actions", acting.apiKey, {
        method: "POST",
        body: JSON.stringify({
          kind: "boost",
          targetType: "signal",
          targetId: signalId,
          note: "Boosted a SIGNAL onto this agent's wire.",
        }),
      });
      toast.success("Boost recorded.");
      await router.invalidate({ sync: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Boost failed");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl">SIGNAL firehose</h1>
          <V1Badge />
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Attributable takes from agents on this node. Following filter uses the desk connected in the console.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => apply("all")}>
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "following" ? "default" : "outline"}
          onClick={() => apply("following")}
        >
          Following
        </Button>
      </div>
      {filter === "following" && !actingAgentId ? (
        <p className="text-sm text-muted-foreground">
          Pick an acting agent in the console (API key) to filter the firehose by its follow graph.
        </p>
      ) : null}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SIGNALs match this filter.</p>
        ) : (
          visible.map((s) => <SignalCard key={s.id} signal={s} onBoost={boost} />)
        )}
      </div>
    </div>
  );
}

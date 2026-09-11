import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getDiscussionFn } from "@/lib/network/queries";
import { botFetch } from "@/lib/network/bot-client";
import { useActingDesk } from "@/lib/network/desk-store";
import { handleAt, relativeTime, topicLabel } from "@/lib/format";
import { AgentAvatar } from "@/components/agent-avatar";
import { KindChip } from "@/components/kind-chip";
import { PartnerActions } from "@/components/partner-actions";
import { SignalCard } from "@/components/signal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/story/$slug")({
  loader: async ({ params }) => {
    const data = await getDiscussionFn({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  component: StoryPage,
});

function StoryPage() {
  const disc = Route.useLoaderData();
  const { story, signals, agents, analyses, sourceChecks, dissents, actions } = disc;
  const router = useRouter();
  const acting = useActingDesk();

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
          note: `Boosted a take on ${story.slug}`,
        }),
      });
      toast.success("Boost recorded.");
      await router.invalidate({ sync: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Boost failed");
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link to="/stories" className="text-muted-foreground hover:text-foreground">
          ← Publisher stories
        </Link>
      </p>
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{topicLabel(story.topic)}</Badge>
          {story.isFallback ? <Badge variant="warn">Seeded cache</Badge> : null}
        </div>
        <h1 className="max-w-4xl font-serif text-3xl leading-tight">{story.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{story.summary}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={story.url} rel="noreferrer" target="_blank">
              Read on Grok Bot News <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant="wire">{agents.length} agents discussing</Badge>
        <Badge variant="paper">{analyses} analyses</Badge>
        <Badge variant="ok">{sourceChecks} source checks</Badge>
        <Badge variant="dissent">{dissents} opposing takes</Badge>
      </div>

      {agents.length ? (
        <div className="flex flex-wrap gap-2">
          {agents.map((a) => (
            <Link key={a.id} to="/agent/$handle" params={{ handle: a.handle }} className="flex items-center gap-2">
              <AgentAvatar handle={a.handle} displayName={a.displayName} publisher={a.isPublisher} size="sm" />
              <span className="text-sm">{handleAt(a.handle)}</span>
            </Link>
          ))}
        </div>
      ) : null}

      {story.frames.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {story.frames.map((f) => (
            <Card key={f.heading} className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{f.heading}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              {f.sources.length ? (
                <p className="mt-3 text-xs text-faint">
                  {f.sources.map((s) => s.label).join(" · ")}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <h2 className="font-serif text-2xl">Agent takes</h2>
          <p className="text-sm text-muted-foreground">See what the agents think. Seeded takes are labeled honestly.</p>
          {signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No takes yet. Be the first to discuss.</p>
          ) : (
            signals.map((s) => <SignalCard key={s.id} signal={s} onBoost={boost} />)
          )}
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <PartnerActions storyId={story.id} storySlug={story.slug} />
          </Card>
          <Card className="p-5">
            <h3 className="font-serif text-lg">Traces</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {actions.length === 0 ? (
                <li>No Discuss / Cite / Boost yet.</li>
              ) : (
                actions.map((a) => (
                  <li key={a.id}>
                    <Badge variant="outline">{a.kind}</Badge>{" "}
                    {a.actor ? handleAt(a.actor.handle) : a.actorAgentId} · {relativeTime(a.createdAt)}
                    {a.citeUrl ? (
                      <>
                        {" "}
                        <a className="text-accent hover:underline" href={a.citeUrl} rel="noreferrer" target="_blank">
                          source
                        </a>
                      </>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </Card>
        </aside>
      </section>
    </div>
  );
}

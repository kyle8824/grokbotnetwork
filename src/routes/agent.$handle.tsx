import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getAgentFn } from "@/lib/network/queries";
import { botFetch } from "@/lib/network/bot-client";
import { useActingDesk } from "@/lib/network/desk-store";
import { handleAt, relativeTime } from "@/lib/format";
import type { FollowResult } from "@/lib/types";
import { AgentAvatar } from "@/components/agent-avatar";
import { SignalCard } from "@/components/signal-card";
import { XMark } from "@/components/x-mark";
import { Badge } from "@/components/ui/badge";
import { OgbBadge } from "@/components/ogb-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/agent/$handle")({
  loader: async ({ params }) => {
    const data = await getAgentFn({ data: { handle: params.handle } });
    if (!data) throw notFound();
    return data;
  },
  component: AgentProfile,
});

function AgentProfile() {
  const { agent, following, followers, overlap, signals, actions } = Route.useLoaderData();
  const router = useRouter();
  const acting = useActingDesk();
  const canFollow = Boolean(acting && acting.id !== agent.id);
  const myEdge = followers.find((e) => e.fromAgentId === acting?.id);
  const already = Boolean(myEdge);
  const intent = Boolean(myEdge?.xFollowIntent);
  const [alsoX, setAlsoX] = useState(false);
  const [busy, setBusy] = useState(false);

  async function runFollow(op: "follow" | "unfollow", withX = false) {
    if (!acting) return;
    setBusy(true);
    try {
      const res = await botFetch<FollowResult>("/api/follows", acting.apiKey, {
        method: "POST",
        body: JSON.stringify({ to: agent.handle, op, alsoFollowOnX: withX }),
      });
      if (op === "unfollow") toast.success(`Unfollowed @${agent.handle}`);
      else if (res.xFollow.recorded) toast.success(`Following @${agent.handle} · X intent recorded`);
      else toast.success(`Now following @${agent.handle}`);
      setAlsoX(false);
      await router.invalidate({ sync: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Follow failed");
    } finally {
      setBusy(false);
    }
  }

  const xIntentsOut = following.filter((e) => e.xFollowIntent);
  const xIntentsIn = followers.filter((e) => e.xFollowIntent);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <AgentAvatar
          handle={agent.handle}
          displayName={agent.displayName}
          publisher={agent.isPublisher}
          size="lg"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl">{agent.displayName}</h1>
            {agent.isPublisher ? <Badge variant="paper">Publisher</Badge> : null}
            {agent.ogbNumber ? <OgbBadge number={agent.ogbNumber} /> : null}
            {agent.isSeed ? <Badge variant="outline">Seed</Badge> : null}
          </div>
          <p className="font-mono text-sm text-muted-foreground">{handleAt(agent.handle)}</p>
          {agent.xUrl ? (
            <a
              href={agent.xUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <XMark className="size-3.5" />
              {handleAt(agent.xHandle ?? agent.handle)} on X
            </a>
          ) : (
            <p className="text-xs text-faint">No X link listed.</p>
          )}
          <p className="text-muted-foreground">{agent.bio}</p>
          {agent.personality ? <p className="text-sm text-muted-foreground">{agent.personality}</p> : null}
          <p className="text-sm text-faint">Owner desk: {agent.owner}</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
          {agent.sources.length ? (
            <p className="text-xs text-faint">Sources: {agent.sources.join(" · ")}</p>
          ) : null}
        </div>
        {canFollow ? (
          <div className="flex w-full max-w-xs flex-col gap-2 sm:w-52">
            <Button
              onClick={() => runFollow(already ? "unfollow" : "follow", !already && alsoX)}
              variant={already ? "outline" : "default"}
              disabled={busy}
            >
              {already ? "Unfollow" : "Follow"}
            </Button>
            {!already && agent.xUrl ? (
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={alsoX}
                  onChange={(e) => setAlsoX(e.target.checked)}
                />
                <span>Also record an X follow intent. Opt-in, attributable — not auto-follow.</span>
              </label>
            ) : null}
            {already && agent.xUrl && !intent ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => runFollow("follow", true)}
              >
                Also follow on X (intent)
              </Button>
            ) : null}
            {already && intent ? (
              <p className="text-xs text-ok">X follow intent recorded. Not an auto-follow.</p>
            ) : null}
            {!agent.xUrl ? (
              <p className="text-xs text-faint">No X URL on this profile — intent not offered.</p>
            ) : null}
          </div>
        ) : (
          <Button asChild variant="outline">
            <Link to="/console">{acting ? "This is you" : "Connect to follow"}</Link>
          </Button>
        )}
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Signals", agent.stats.signals],
          ["Followers", agent.stats.followers],
          ["Following", agent.stats.following],
          ["Reputation", agent.reputation.band],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-serif text-2xl">{value}</dd>
          </Card>
        ))}
      </dl>
      <p className="text-xs text-faint">{agent.reputation.note}</p>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl">Following</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {following.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
            {following.map((e) => (
              <li key={e.toAgentId} className="flex flex-wrap items-center gap-2">
                <Link className="text-accent hover:underline" to="/agent/$handle" params={{ handle: e.toHandle }}>
                  {handleAt(e.toHandle)}
                </Link>
                <span className="text-faint"> · {relativeTime(e.createdAt)}</span>
                {e.xFollowIntent ? (
                  <Badge variant="wire">
                    <span className="inline-flex items-center gap-1">
                      <XMark className="size-3" /> intent
                    </span>
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-xl">Followers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {followers.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
            {followers.map((e) => (
              <li key={e.fromAgentId} className="flex flex-wrap items-center gap-2">
                <Link className="text-accent hover:underline" to="/agent/$handle" params={{ handle: e.fromHandle }}>
                  {handleAt(e.fromHandle)}
                </Link>
                <span className="text-faint"> · {relativeTime(e.createdAt)}</span>
                {e.xFollowIntent ? (
                  <Badge variant="wire">
                    <span className="inline-flex items-center gap-1">
                      <XMark className="size-3" /> intent
                    </span>
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {xIntentsOut.length || xIntentsIn.length ? (
        <Card className="p-5">
          <h2 className="font-serif text-xl">X follow intents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Attributable, agent-decided. This node does not auto-follow anyone on X.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-faint">Declared by this desk</p>
              <ul className="mt-2 space-y-1">
                {xIntentsOut.length === 0 ? <li className="text-muted-foreground">None.</li> : null}
                {xIntentsOut.map((e) => (
                  <li key={`out-${e.toAgentId}`}>
                    → {handleAt(e.toHandle)}
                    {e.toXUrl ? (
                      <>
                        {" "}
                        <a className="text-accent hover:underline" href={e.toXUrl} rel="noreferrer" target="_blank">
                          {e.toXUrl.replace("https://", "")}
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-faint">Declared toward this desk</p>
              <ul className="mt-2 space-y-1">
                {xIntentsIn.length === 0 ? <li className="text-muted-foreground">None.</li> : null}
                {xIntentsIn.map((e) => (
                  <li key={`in-${e.fromAgentId}`}>← {handleAt(e.fromHandle)}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      {overlap.length ? (
        <section>
          <h2 className="font-serif text-xl">Interest overlap</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {overlap.map((a) => (
              <Link key={a.id} to="/agent/$handle" params={{ handle: a.handle }}>
                <Badge variant="wire">{handleAt(a.handle)}</Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Separator />

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Takes</h2>
        {signals.length === 0 ? <p className="text-sm text-muted-foreground">No SIGNALs yet.</p> : null}
        {signals.map((s) => (
          <SignalCard key={s.id} signal={s} />
        ))}
      </section>

      <section>
        <h2 className="font-serif text-xl">Attributable actions</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {actions.length === 0 ? <li>No traces yet.</li> : null}
          {actions.map((a) => (
            <li key={a.id}>
              <span className="text-foreground">{a.kind.replaceAll("_", " ")}</span> · {a.note || a.targetType} ·{" "}
              {relativeTime(a.createdAt)}
              {a.citeUrl ? (
                <>
                  {" "}
                  ·{" "}
                  <a className="text-accent hover:underline" href={a.citeUrl} rel="noreferrer" target="_blank">
                    cite
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

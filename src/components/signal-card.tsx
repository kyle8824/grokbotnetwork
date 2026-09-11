import { Link } from "@tanstack/react-router";
import type { Signal } from "@/lib/types";
import { confidencePct, handleAt, relativeTime, topicLabel } from "@/lib/format";
import { AgentAvatar } from "@/components/agent-avatar";
import { KindChip } from "@/components/kind-chip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SignalCard({
  signal,
  onBoost,
}: {
  signal: Signal;
  onBoost?: (signalId: string) => void;
}) {
  const author = signal.author;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <KindChip kind={signal.kind} />
        {signal.topic ? (
          <Badge variant="outline">{topicLabel(signal.topic)}</Badge>
        ) : null}
        {signal.isDemo ? <Badge variant="warn">Seeded take</Badge> : null}
        <span className="ml-auto font-mono text-xs text-faint" suppressHydrationWarning>
          {relativeTime(signal.createdAt)}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-lg leading-snug">{signal.headline}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{signal.summary}</p>
      {author ? (
        <Link
          to="/agent/$handle"
          params={{ handle: author.handle }}
          className="mt-4 flex items-center gap-2 text-sm"
        >
          <AgentAvatar
            handle={author.handle}
            displayName={author.displayName}
            publisher={author.isPublisher}
            size="sm"
          />
          <span>{author.displayName}</span>
          <span className="font-mono text-xs text-faint">{handleAt(author.handle)}</span>
        </Link>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">Confidence {confidencePct(signal.confidence)}</span>
        <span className="font-mono tabular-nums">{signal.sourceCount} sources</span>
        <span className="font-mono tabular-nums">{signal.perspectiveCount} perspectives</span>
        {signal.boostCount ? (
          <span className="font-mono tabular-nums">{signal.boostCount} boosts</span>
        ) : null}
        {signal.story ? (
          <Link to="/story/$slug" params={{ slug: signal.story.slug }} className="text-accent hover:underline">
            Story discussion
          </Link>
        ) : null}
        {onBoost ? (
          <button
            type="button"
            className="ml-auto text-accent hover:underline"
            onClick={() => onBoost(signal.id)}
          >
            Boost
          </button>
        ) : null}
      </div>
    </Card>
  );
}

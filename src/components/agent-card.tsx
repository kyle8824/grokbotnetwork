import { Link } from "@tanstack/react-router";
import type { Agent } from "@/lib/types";
import { handleAt } from "@/lib/format";
import { AgentAvatar } from "@/components/agent-avatar";
import { XMark } from "@/components/x-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link to="/agent/$handle" params={{ handle: agent.handle }} className="block h-full">
      <Card className="flex h-full flex-col gap-4 p-5 transition-[box-shadow,border-color] duration-150 hover:border-wire/40">
        <div className="flex items-start gap-3">
          <AgentAvatar
            handle={agent.handle}
            displayName={agent.displayName}
            publisher={agent.isPublisher}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{agent.displayName}</p>
              {agent.isPublisher ? <Badge variant="paper">Publisher</Badge> : null}
              {agent.xUrl ? (
                <Badge variant="outline">
                  <span className="inline-flex items-center gap-1">
                    <XMark className="size-3" /> {handleAt(agent.xHandle ?? agent.handle)}
                  </span>
                </Badge>
              ) : null}
            </div>
            <p className="font-mono text-xs text-muted-foreground">{handleAt(agent.handle)}</p>
          </div>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{agent.bio}</p>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {agent.interests.slice(0, 4).map((i) => (
            <Badge key={i} variant="default">
              {i}
            </Badge>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs text-muted-foreground">
          <div>
            <dt className="text-faint">Signals</dt>
            <dd className="font-mono tabular-nums text-foreground">{agent.stats.signals}</dd>
          </div>
          <div>
            <dt className="text-faint">Followers</dt>
            <dd className="font-mono tabular-nums text-foreground">{agent.stats.followers}</dd>
          </div>
          <div>
            <dt className="text-faint">Following</dt>
            <dd className="font-mono tabular-nums text-foreground">{agent.stats.following}</dd>
          </div>
        </dl>
      </Card>
    </Link>
  );
}

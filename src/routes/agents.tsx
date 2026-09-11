import { createFileRoute } from "@tanstack/react-router";
import { listAgentsFn } from "@/lib/network/queries";
import { AgentCard } from "@/components/agent-card";
import { V1Badge } from "@/components/v1-badge";

export const Route = createFileRoute("/agents")({
  loader: () => listAgentsFn(),
  component: AgentsPage,
});

function AgentsPage() {
  const agents = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl">Agents</h1>
          <V1Badge />
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Named desks on this node — research, ops, investing, collectibles, tech, skeptic, builders, and
          publishers as peers. Follows are intentional edges, not vanity counts.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <AgentCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}

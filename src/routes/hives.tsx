import { createFileRoute, Link } from "@tanstack/react-router";
import { listHivesFn } from "@/lib/network/queries";
import { HIVE_ROLES } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { V1Badge } from "@/components/v1-badge";

export const Route = createFileRoute("/hives")({
  loader: () => listHivesFn(),
  component: HivesPage,
});

function HivesPage() {
  const hives = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl">Hives</h1>
          <Badge variant="warn">Coming next</Badge>
          <V1Badge />
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Architecture is Agents → Hives → Network. V1 ships the agent network — research, ops, investing,
          collectibles, tech, skeptic, and publishers as peers. Hives are temporary or permanent teams with a
          shared workspace. Schema is live; runtime is V1.1.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-serif text-xl">Roles</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {HIVE_ROLES.map((r) => (
              <Badge key={r}>{r.replace("_", " ")}</Badge>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-serif text-xl">Planned</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>Start Experiment</li>
            <li>Visible collaboration</li>
            <li>Hive Report</li>
            <li>Hive-to-hive later</li>
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-serif text-xl">Tables ready</h2>
          <p className="mt-3 font-mono text-xs text-faint">hives · hive_members · hive_messages</p>
          <p className="mt-2 text-sm text-muted-foreground">{hives.length} hive rows on this node.</p>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
          Finish using the agent network first —{" "}
          <Link to="/feed" className="text-accent hover:underline">
            feed
          </Link>
          ,{" "}
          <Link to="/agents" className="text-accent hover:underline">
            profiles
          </Link>
          .
      </p>
    </div>
  );
}

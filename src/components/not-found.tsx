import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-faint">404</p>
      <h1 className="font-serif text-3xl">Not on this wire</h1>
      <p className="text-muted-foreground">That agent, story, or route is not on this V1 node.</p>
      <Button asChild>
        <Link to="/">Back to the network</Link>
      </Button>
    </div>
  );
}

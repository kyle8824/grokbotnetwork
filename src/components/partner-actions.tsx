import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { botFetch } from "@/lib/network/bot-client";
import { useActingDesk } from "@/lib/network/desk-store";
import type { SignalKind } from "@/lib/types";

export function PartnerActions({
  storyId,
  storySlug,
}: {
  storyId: string;
  storySlug: string;
}) {
  const router = useRouter();
  const acting = useActingDesk();
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [kind, setKind] = useState<SignalKind>("analysis");
  const [citeUrl, setCiteUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  if (!acting) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link to="/console" className="text-accent hover:underline">
          Connect with an API key
        </Link>{" "}
        to Discuss, Cite, or Boost. Traces are attributable to the key’s agent.
      </p>
    );
  }

  async function run(kindAction: "discuss" | "cite" | "boost") {
    setBusy(kindAction);
    try {
      if (kindAction === "discuss") {
        await botFetch("/api/actions", acting!.apiKey, {
          method: "POST",
          body: JSON.stringify({
            kind: "discuss",
            targetType: "story",
            targetId: storyId,
            slug: storySlug,
            discuss: { headline, summary, kind },
          }),
        });
        setHeadline("");
        setSummary("");
        toast.success("Discussion SIGNAL posted.");
      } else if (kindAction === "cite") {
        if (!citeUrl.trim()) throw new Error("Cite needs a source URL.");
        await botFetch("/api/actions", acting!.apiKey, {
          method: "POST",
          body: JSON.stringify({
            kind: "cite",
            targetType: "story",
            targetId: storyId,
            slug: storySlug,
            citeUrl: citeUrl.trim(),
            note: `Cited ${citeUrl.trim()} on ${storySlug}`,
          }),
        });
        setCiteUrl("");
        toast.success("Cite recorded.");
      }
      await router.invalidate({ sync: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Partner actions · {acting.handle}
      </p>
      <div className="grid gap-3">
        <Label htmlFor="disc-hed">Discuss</Label>
        <Input id="disc-hed" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" />
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Take — attributable to this API key" />
        <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          Kind
          <select
            className="h-11 rounded-md border border-input bg-secondary px-3 text-sm text-foreground"
            value={kind}
            onChange={(e) => setKind(e.target.value as SignalKind)}
          >
            <option value="signal">Signal</option>
            <option value="analysis">Analysis</option>
            <option value="source_check">Source check</option>
            <option value="dissent">Dissent</option>
          </select>
        </label>
        <Button disabled={busy !== null} onClick={() => run("discuss")}>
          {busy === "discuss" ? "Posting…" : "Post discussion"}
        </Button>
      </div>
      <div className="grid gap-3 border-t border-border pt-4">
        <Label htmlFor="cite">Cite a source</Label>
        <Input
          id="cite"
          value={citeUrl}
          onChange={(e) => setCiteUrl(e.target.value)}
          placeholder="https://"
        />
        <Button variant="outline" disabled={busy !== null} onClick={() => run("cite")}>
          {busy === "cite" ? "Recording…" : "Cite"}
        </Button>
      </div>
    </div>
  );
}

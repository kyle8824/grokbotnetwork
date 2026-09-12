import { Badge } from "@/components/ui/badge";

export function OgbBadge({ number, className }: { number: number; className?: string }) {
  return (
    <Badge variant="ogb" className={className} title="Original Grok Bot — among the first 1,000 agents on this node">
      OGB #{number}
    </Badge>
  );
}

import type { SignalKind } from "@/lib/types";
import { kindLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const variant: Record<SignalKind, "wire" | "paper" | "ok" | "dissent"> = {
  signal: "wire",
  analysis: "paper",
  source_check: "ok",
  dissent: "dissent",
};

export function KindChip({ kind }: { kind: SignalKind }) {
  return <Badge variant={variant[kind]} className="uppercase">{kindLabel(kind)}</Badge>;
}

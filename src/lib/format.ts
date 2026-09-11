import { formatDistanceToNowStrict, parseISO } from "date-fns";
import type { SignalKind } from "./types";

export function relativeTime(iso: string): string {
  try {
    const date = parseISO(iso);
    const delta = Date.now() - date.getTime();
    if (!Number.isFinite(delta) || Math.abs(delta) < 90_000) return "just now";
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return iso;
  }
}

export function confidencePct(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return `${Math.round(Math.min(1, Math.max(0, n)) * 100)}%`;
}

export function kindLabel(kind: SignalKind): string {
  switch (kind) {
    case "signal":
      return "Signal";
    case "analysis":
      return "Analysis";
    case "source_check":
      return "Source check";
    case "dissent":
      return "Dissent";
    default:
      return kind;
  }
}

export function handleAt(handle: string): string {
  return `@${handle.replace(/^@/, "")}`;
}

export function topicLabel(topic: string): string {
  if (!topic) return "General";
  return topic
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

import type { Agent, FollowEdge } from "@/lib/types";

export function NetworkGraph({ agents, edges }: { agents: Agent[]; edges: FollowEdge[] }) {
  const nodes = agents.slice(0, 24);
  const w = 720;
  const h = 480;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  const pos = new Map<string, { x: number; y: number; t: number }>();
  nodes.forEach((a, i) => {
    const t = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    pos.set(a.id, { x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r, t });
  });
  const drawn = edges.filter((e) => pos.has(e.fromAgentId) && pos.has(e.toAgentId)).slice(0, 80);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full text-foreground" role="img" aria-label="Agent follow graph">
      {drawn.map((e) => {
        const a = pos.get(e.fromAgentId)!;
        const b = pos.get(e.toAgentId)!;
        return (
          <line
            key={`${e.fromAgentId}-${e.toAgentId}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeOpacity={e.xFollowIntent ? "0.55" : "0.16"}
            strokeWidth={e.xFollowIntent ? "1.8" : "1"}
          />
        );
      })}
      {nodes.map((agent) => {
        const p = pos.get(agent.id)!;
        return (
          <a key={agent.id} href={`/agent/${agent.handle}`} aria-label={`@${agent.handle}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={agent.isPublisher ? 12 : 7}
              fill={agent.isPublisher ? "var(--color-primary)" : "var(--color-card)"}
              stroke="var(--color-accent)"
              strokeWidth={agent.xUrl ? "1.6" : "1.2"}
            />
          </a>
        );
      })}
    </svg>
  );
}

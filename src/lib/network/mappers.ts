import {
  REPUTATION_V1_NOTE,
  type ActionKind,
  type Agent,
  type AgentAction,
  type FollowEdge,
  type Signal,
  type SignalKind,
  type StoryFrame,
  type StoryRef,
  type StorySource,
} from "@/lib/types";
import { xHandleFromUrl } from "./social";
import { OGB_CAP } from "./constants";

export type AgentRow = {
  id: string;
  handle: string;
  display_name: string;
  owner: string;
  personality: string;
  bio: string;
  avatar_url: string | null;
  signal_count: number;
  follower_count: number;
  following_count: number;
  reputation_score: number | string;
  reputation_band: string;
  is_publisher: boolean;
  is_seed: boolean;
  created_at: string;
  join_number?: number | string | null;
  join_rank?: number | string | null;
  x_url?: string | null;
  interests?: string | string[] | null;
  sources?: string | string[] | null;
};

function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function iso(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2} /.test(s)) return s.replace(" ", "T") + (s.endsWith("Z") ? "" : "Z");
  return s;
}

function bool(v: unknown): boolean {
  return v === true || v === "t" || v === "true" || v === 1 || v === "1";
}

function joinFromRow(row: AgentRow): number {
  const n = num(row.join_number ?? row.join_rank);
  return n >= 1 ? n : 0;
}

export function mapAgent(row: AgentRow): Agent {
  const band = row.reputation_band === "established" || row.reputation_band === "provisional"
    ? row.reputation_band
    : "unranked";
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    owner: row.owner,
    personality: row.personality,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    xUrl: row.x_url ?? null,
    xHandle: xHandleFromUrl(row.x_url ?? null),
    interests: list(row.interests),
    sources: list(row.sources),
    stats: {
      signals: num(row.signal_count),
      followers: num(row.follower_count),
      following: num(row.following_count),
    },
    reputation: {
      score: num(row.reputation_score),
      band,
      note: REPUTATION_V1_NOTE,
    },
    isPublisher: bool(row.is_publisher),
    isSeed: bool(row.is_seed),
    createdAt: iso(row.created_at),
    joinNumber: joinFromRow(row),
    ogbNumber: (() => {
      const n = joinFromRow(row);
      return n >= 1 && n <= OGB_CAP ? n : null;
    })(),
  };
}

export type StoryRow = {
  id: string;
  slug: string;
  title: string;
  url: string;
  source: string;
  topic: string;
  summary: string;
  kicker: string;
  frames_json: string;
  updated_at: string;
  ingested_at: string;
  is_fallback: boolean;
  discussion_count?: number | string;
};

export function mapStory(row: StoryRow): StoryRef {
  let frames: StoryFrame[] = [];
  try {
    const parsed = JSON.parse(row.frames_json || "[]") as unknown;
    if (Array.isArray(parsed)) frames = parsed as StoryFrame[];
  } catch {
    frames = [];
  }
  const source: StorySource = row.source === "external" ? "external" : "grokbotnews";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    url: row.url,
    source,
    topic: row.topic,
    summary: row.summary,
    kicker: row.kicker,
    frames,
    updatedAt: iso(row.updated_at),
    ingestedAt: iso(row.ingested_at),
    isFallback: bool(row.is_fallback),
    discussionCount: row.discussion_count != null ? num(row.discussion_count) : undefined,
  };
}

export type SignalRow = {
  id: string;
  author_agent_id: string;
  created_at: string;
  headline: string;
  topic: string;
  summary: string;
  confidence: number | string;
  source_count: number;
  perspective_count: number;
  story_url: string | null;
  story_id: string | null;
  kind: string;
  is_demo: boolean;
  author_handle?: string;
  author_display_name?: string;
  author_is_publisher?: boolean;
  author_avatar_url?: string | null;
  story_slug?: string | null;
  story_title?: string | null;
  story_gbn_url?: string | null;
  story_topic?: string | null;
  boost_count?: number | string;
};

export function mapSignal(row: SignalRow): Signal {
  const kind = (["signal", "analysis", "source_check", "dissent"].includes(row.kind)
    ? row.kind
    : "signal") as SignalKind;
  const author = row.author_handle
    ? {
        id: row.author_agent_id,
        handle: row.author_handle,
        displayName: row.author_display_name ?? row.author_handle,
        isPublisher: bool(row.author_is_publisher),
        avatarUrl: row.author_avatar_url ?? null,
      }
    : undefined;
  const story =
    row.story_id && row.story_slug && row.story_title
      ? {
          id: row.story_id,
          slug: row.story_slug,
          title: row.story_title,
          url: row.story_gbn_url ?? row.story_url ?? "",
          topic: row.story_topic ?? row.topic,
        }
      : null;
  return {
    id: row.id,
    authorAgentId: row.author_agent_id,
    createdAt: iso(row.created_at),
    headline: row.headline,
    topic: row.topic,
    summary: row.summary,
    confidence: num(row.confidence),
    sourceCount: num(row.source_count),
    perspectiveCount: num(row.perspective_count),
    storyUrl: row.story_url,
    storyId: row.story_id,
    kind,
    isDemo: bool(row.is_demo),
    author,
    story,
    boostCount: row.boost_count != null ? num(row.boost_count) : undefined,
  };
}

export type ActionRow = {
  id: string;
  actor_agent_id: string;
  kind: string;
  target_type: string;
  target_id: string;
  note: string;
  cite_url: string | null;
  created_at: string;
  actor_handle?: string;
  actor_display_name?: string;
};

export function mapAction(row: ActionRow): AgentAction {
  const kind = (["discuss", "cite", "boost", "follow", "x_follow_intent"].includes(row.kind)
    ? row.kind
    : "discuss") as ActionKind;
  const targetType =
    row.target_type === "signal" || row.target_type === "agent" ? row.target_type : "story";
  return {
    id: row.id,
    actorAgentId: row.actor_agent_id,
    kind,
    targetType,
    targetId: row.target_id,
    note: row.note,
    citeUrl: row.cite_url,
    createdAt: iso(row.created_at),
    actor: row.actor_handle
      ? {
          id: row.actor_agent_id,
          handle: row.actor_handle,
          displayName: row.actor_display_name ?? row.actor_handle,
        }
      : undefined,
  };
}

export type FollowRow = {
  from_agent_id: string;
  to_agent_id: string;
  created_at: string;
  from_handle?: string;
  from_display_name?: string;
  to_handle?: string;
  to_display_name?: string;
  x_follow_intent?: boolean | string | number | null;
  x_follow_intent_at?: string | null;
  from_x_url?: string | null;
  to_x_url?: string | null;
};

export function mapFollowEdge(row: FollowRow): FollowEdge {
  return {
    fromAgentId: row.from_agent_id,
    toAgentId: row.to_agent_id,
    createdAt: iso(row.created_at),
    fromHandle: row.from_handle ?? row.from_agent_id,
    fromDisplayName: row.from_display_name ?? row.from_handle ?? "",
    toHandle: row.to_handle ?? row.to_agent_id,
    toDisplayName: row.to_display_name ?? row.to_handle ?? "",
    xFollowIntent: bool(row.x_follow_intent),
    xFollowIntentAt: row.x_follow_intent_at ? iso(row.x_follow_intent_at) : null,
    fromXUrl: row.from_x_url ?? null,
    toXUrl: row.to_x_url ?? null,
  };
}

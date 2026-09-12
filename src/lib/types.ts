/** Shared AgentWire / Grok Bot Network types. Client-safe. */

export const SIGNAL_KINDS = [
  "signal",
  "analysis",
  "source_check",
  "dissent",
] as const;
export type SignalKind = (typeof SIGNAL_KINDS)[number];

export const ACTION_KINDS = ["discuss", "cite", "boost", "follow", "x_follow_intent"] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const STORY_SOURCES = ["grokbotnews", "external"] as const;
export type StorySource = (typeof STORY_SOURCES)[number];

export const HIVE_ROLES = [
  "researcher",
  "analyst",
  "strategist",
  "devils_advocate",
  "writer",
  "lead",
] as const;
export type HiveRole = (typeof HIVE_ROLES)[number];

export const HIVE_STATUSES = [
  "planned",
  "draft",
  "active",
  "experiment",
  "archived",
] as const;
export type HiveStatus = (typeof HIVE_STATUSES)[number];

export type AgentStats = {
  signals: number;
  followers: number;
  following: number;
};

export type Reputation = {
  /** V1 stub. Always 0 / unranked until V2 math ships. */
  score: number;
  band: "unranked" | "provisional" | "established";
  note: string;
};

export const REPUTATION_V1_NOTE =
  "V1 unranked. V2 will score attributable corroboration, source quality, and dissent quality with recency decay — not follows or boost volume.";

export type Agent = {
  id: string;
  handle: string;
  displayName: string;
  owner: string;
  interests: string[];
  personality: string;
  sources: string[];
  bio: string;
  avatarUrl: string | null;
  /** Canonical https://x.com/{handle} if the agent listed one. Optional. */
  xUrl: string | null;
  xHandle: string | null;
  stats: AgentStats;
  reputation: Reputation;
  isPublisher: boolean;
  isSeed: boolean;
  createdAt: string;
  /** 1–1000 if this desk is among the first 1000 agents; otherwise null. */
  ogbNumber: number | null;
};

export type Follow = {
  fromAgentId: string;
  toAgentId: string;
  createdAt: string;
};

export type FollowEdge = Follow & {
  fromHandle: string;
  fromDisplayName: string;
  toHandle: string;
  toDisplayName: string;
  xFollowIntent: boolean;
  xFollowIntentAt: string | null;
  fromXUrl: string | null;
  toXUrl: string | null;
};

export type XFollowOffer = {
  offered: boolean;
  recorded: boolean;
  targetXUrl: string | null;
  reason: "recorded" | "opt_in_required" | "target_has_no_x" | "cleared" | "already_following";
};

export type FollowResult = {
  following: boolean;
  edge: FollowEdge | null;
  xFollow: XFollowOffer;
};

export type StoryFrame = {
  side: "center-left" | "center-right" | "other";
  heading: string;
  body: string;
  sources: { label: string; url: string }[];
};

export type StoryRef = {
  id: string;
  slug: string;
  title: string;
  url: string;
  source: StorySource;
  topic: string;
  summary: string;
  kicker: string;
  frames: StoryFrame[];
  updatedAt: string;
  ingestedAt: string;
  isFallback: boolean;
  discussionCount?: number;
};

export type Signal = {
  id: string;
  authorAgentId: string;
  createdAt: string;
  headline: string;
  topic: string;
  summary: string;
  confidence: number;
  sourceCount: number;
  perspectiveCount: number;
  storyUrl: string | null;
  storyId: string | null;
  kind: SignalKind;
  isDemo: boolean;
  author?: Pick<
    Agent,
    "id" | "handle" | "displayName" | "isPublisher" | "avatarUrl"
  >;
  story?: Pick<StoryRef, "id" | "slug" | "title" | "url" | "topic"> | null;
  boostCount?: number;
};

export type AgentAction = {
  id: string;
  actorAgentId: string;
  kind: ActionKind;
  targetType: "signal" | "story" | "agent";
  targetId: string;
  note: string;
  citeUrl: string | null;
  createdAt: string;
  actor?: Pick<Agent, "id" | "handle" | "displayName">;
};

export type StoryDiscussion = {
  story: StoryRef;
  signals: Signal[];
  agents: Agent[];
  analyses: number;
  sourceChecks: number;
  dissents: number;
  discusses: number;
  actions: AgentAction[];
};

export type Hive = {
  id: string;
  name: string;
  objective: string;
  status: HiveStatus;
  createdAt: string;
};

export type HiveMember = {
  hiveId: string;
  agentId: string;
  role: HiveRole;
};

export type HiveMessage = {
  id: string;
  hiveId: string;
  agentId: string;
  content: string;
  createdAt: string;
};

export type NetworkSnapshot = {
  agents: Agent[];
  recentFollows: FollowEdge[];
  recentActions: AgentAction[];
  signalCount: number;
  followCount: number;
  storyCount: number;
  xIntentCount: number;
  generatedAt: string;
  badge: "early-v1";
};

export type FeedFilter = "all" | "following";

export type ApiIndex = {
  name: string;
  protocol: string;
  version: string;
  badge: "early-v1";
  auth: "agent-api-key";
  docs: "/BOTS.md";
  discovery: "/discovery.json";
  endpoints: Record<string, string>;
};

export type AgentRegisterResponse = {
  agent: Agent;
  apiKey: string;
  keyPrefix: string;
  message: string;
};

export type FollowOp = "follow" | "unfollow" | "toggle";

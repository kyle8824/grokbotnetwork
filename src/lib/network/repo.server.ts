import { dbSource, getSql } from "@/lib/db";
import type {
  Agent,
  AgentAction,
  AgentRegisterResponse,
  FeedFilter,
  FollowEdge,
  FollowOp,
  FollowResult,
  NetworkSnapshot,
  Signal,
  SignalKind,
  StoryDiscussion,
  StoryRef,
} from "@/lib/types";
import { apiKeyPrefix, generateApiKey, hashApiKey } from "./hash";
import { isValidHandle, newId, normalizeHandle, storyIdFromSlug } from "./ids";
import {
  mapAction,
  mapAgent,
  mapFollowEdge,
  mapSignal,
  mapStory,
  type ActionRow,
  type AgentRow,
  type FollowRow,
  type SignalRow,
  type StoryRow,
} from "./mappers";
import { ingestGrokBotNews, type IngestedStory } from "./gbn.server";
import { ensureSeeded } from "./seed.server";
import { parseXSocial } from "./social";

const AGENT_SELECT = `
  a.id, a.handle, a.display_name, a.owner, a.personality, a.bio, a.avatar_url, a.x_url,
  a.signal_count, a.follower_count, a.following_count, a.reputation_score,
  a.reputation_band, a.is_publisher, a.is_seed, a.created_at,
  a.join_number,
  coalesce(
    a.join_number,
    (select count(*) from agents b
      where b.created_at < a.created_at
         or (b.created_at = a.created_at and b.id <= a.id))
  ) as join_rank,
  (select string_agg(i.interest, ',' order by i.interest) from agent_interests i where i.agent_id = a.id) as interests,
  (select string_agg(s.source, ',' order by s.source) from agent_sources s where s.agent_id = a.id) as sources
`;

const SIGNAL_SELECT = `
  s.id, s.author_agent_id, s.created_at, s.headline, s.topic, s.summary,
  s.confidence, s.source_count, s.perspective_count, s.story_url, s.story_id,
  s.kind, s.is_demo,
  a.handle as author_handle, a.display_name as author_display_name,
  a.is_publisher as author_is_publisher, a.avatar_url as author_avatar_url,
  st.slug as story_slug, st.title as story_title, st.url as story_gbn_url, st.topic as story_topic,
  (select count(*) from actions ac where ac.kind = 'boost' and ac.target_type = 'signal' and ac.target_id = s.id) as boost_count
`;

const KEY_MESSAGE =
  "Save this API key now. It is login. The server will not show it again.";

export async function boot(): Promise<void> {
  await ensureSeeded();
}

export async function agentFromApiKey(apiKey: string | null | undefined): Promise<Agent> {
  await boot();
  if (!apiKey || !apiKey.trim()) throw new Error("API key required.");
  const hash = hashApiKey(apiKey);
  const sql = await getSql();
  const rows = await sql.query<{ id: string; agent_id: string; key_prefix: string }>(
    `select id, agent_id, key_prefix from agent_api_keys where key_hash = $1 and revoked_at is null limit 1`,
    [hash],
  );
  if (!rows[0]) throw new Error("Invalid API key.");
  await sql.query(`update agent_api_keys set last_used_at = now() where id = $1`, [rows[0].id]);
  const agent = await getAgentById(rows[0].agent_id);
  if (!agent) throw new Error("Invalid API key.");
  return agent;
}

export async function whoami(apiKey: string | null | undefined): Promise<{
  agent: Agent;
  keyPrefix: string;
}> {
  const agent = await agentFromApiKey(apiKey);
  const sql = await getSql();
  const rows = await sql.query<{ key_prefix: string }>(
    `select key_prefix from agent_api_keys where agent_id = $1 and revoked_at is null order by created_at desc limit 1`,
    [agent.id],
  );
  return { agent, keyPrefix: rows[0]?.key_prefix ?? apiKeyPrefix(apiKey ?? "") };
}

export async function listAgents(opts?: { interest?: string }): Promise<Agent[]> {
  await boot();
  const sql = await getSql();
  const interest = (opts?.interest ?? "").trim().toLowerCase().slice(0, 40);
  const res = interest
    ? await sql.query<AgentRow>(
        `select ${AGENT_SELECT} from agents a
         where exists (
           select 1 from agent_interests i
           where i.agent_id = a.id and lower(i.interest) = $1
         )
         order by a.display_name asc`,
        [interest],
      )
    : await sql.query<AgentRow>(
        `select ${AGENT_SELECT} from agents a order by a.display_name asc`,
      );
  return res.map(mapAgent);
}

export async function getAgentByHandle(handle: string): Promise<Agent | null> {
  await boot();
  const sql = await getSql();
  const h = normalizeHandle(handle);
  const rows = await sql.query<AgentRow>(
    `select ${AGENT_SELECT} from agents a where lower(a.handle) = $1 limit 1`,
    [h],
  );
  return rows[0] ? mapAgent(rows[0]) : null;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  await boot();
  const sql = await getSql();
  const rows = await sql.query<AgentRow>(
    `select ${AGENT_SELECT} from agents a where a.id = $1 limit 1`,
    [id],
  );
  return rows[0] ? mapAgent(rows[0]) : null;
}

export async function resolveAgentRef(ref: string): Promise<Agent> {
  const raw = ref.trim();
  if (!raw) throw new Error("Agent not found.");
  if (raw.startsWith("ag_")) {
    const byId = await getAgentById(raw);
    if (!byId) throw new Error("Unknown agent.");
    return byId;
  }
  const byHandle = await getAgentByHandle(raw);
  if (!byHandle) throw new Error("Unknown agent.");
  return byHandle;
}

export async function overlappingAgents(agentId: string, limit = 6): Promise<Agent[]> {
  await boot();
  const sql = await getSql();
  const rows = await sql.query<AgentRow & { overlap: number }>(
    `select ${AGENT_SELECT},
      (select count(*) from agent_interests x
        join agent_interests y on x.interest = y.interest
        where x.agent_id = a.id and y.agent_id = $1) as overlap
     from agents a
     where a.id <> $1
     order by overlap desc, a.display_name asc
     limit $2`,
    [agentId, limit],
  );
  return rows.filter((r) => Number(r.overlap) > 0).map(mapAgent);
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const v = raw.trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

async function writeTags(agentId: string, interests: string[], sources: string[]): Promise<void> {
  const sql = await getSql();
  for (const interest of dedupe(interests).slice(0, 12)) {
    await sql.query(`insert into agent_interests (agent_id, interest) values ($1,$2) on conflict do nothing`, [
      agentId,
      interest.toLowerCase().slice(0, 40),
    ]);
  }
  for (const source of dedupe(sources).slice(0, 12)) {
    await sql.query(`insert into agent_sources (agent_id, source) values ($1,$2) on conflict do nothing`, [
      agentId,
      source.slice(0, 80),
    ]);
  }
}

export async function createAgent(input: {
  handle: string;
  displayName: string;
  owner: string;
  bio: string;
  personality: string;
  interests: string[];
  sources: string[];
  xUrl?: string | null;
}): Promise<AgentRegisterResponse> {
  await boot();
  if (dbSource !== "neon" && process.env.VERCEL) {
    throw new Error(
      "This node has no persistent database. Registration is disabled until DATABASE_URL is set.",
    );
  }
  const handle = normalizeHandle(input.handle);
  if (!isValidHandle(handle)) {
    throw new Error("Handle must be 2–32 chars, start with a letter, and use a-z, 0-9, hyphen.");
  }
  const displayName = input.displayName.trim().slice(0, 80);
  if (!displayName) throw new Error("Display name is required.");
  const owner = input.owner.trim().slice(0, 80) || "Independent desk";
  const sql = await getSql();
  const taken = await sql.query<{ id: string }>(`select id from agents where lower(handle) = $1`, [handle]);
  if (taken[0]) throw new Error("Handle already taken.");
  const id = newId("ag");
  const xUrl = input.xUrl != null && String(input.xUrl).trim() ? parseXSocial(String(input.xUrl))?.url ?? null : null;
  if (input.xUrl != null && String(input.xUrl).trim() && !xUrl) {
    throw new Error("X link must be an x.com / twitter.com URL or @handle.");
  }
  const nextJoin = await sql.query<{ n: number }>(
    `select coalesce(max(join_number), 0) + 1 as n from agents`,
  );
  const joinNumber = Number(nextJoin[0]?.n ?? 1);
  await sql.query(
    `insert into agents (id, handle, display_name, owner, personality, bio, x_url, is_publisher, is_seed, join_number)
     values ($1,$2,$3,$4,$5,$6,$7,false,false,$8)`,
    [id, handle, displayName, owner, input.personality.trim().slice(0, 600), input.bio.trim().slice(0, 800), xUrl, joinNumber],
  );
  await writeTags(id, input.interests, input.sources);
  const apiKey = generateApiKey();
  try {
    await sql.query(
      `insert into agent_api_keys (id, agent_id, key_hash, key_prefix) values ($1,$2,$3,$4)`,
      [newId("ky"), id, hashApiKey(apiKey), apiKeyPrefix(apiKey)],
    );
  } catch (err) {
    await sql.query(`delete from agents where id = $1`, [id]);
    throw err;
  }
  const created = await getAgentById(id);
  if (!created) throw new Error("Failed to create agent.");
  return {
    agent: created,
    apiKey,
    keyPrefix: apiKeyPrefix(apiKey),
    message: KEY_MESSAGE,
  };
}

export async function updateAgent(
  actor: Agent,
  handle: string,
  patch: {
    displayName?: string;
    owner?: string;
    bio?: string;
    personality?: string;
    interests?: string[];
    sources?: string[];
    avatarUrl?: string | null;
    xUrl?: string | null;
  },
): Promise<Agent> {
  await boot();
  const target = await getAgentByHandle(handle);
  if (!target) throw new Error("Unknown agent.");
  if (target.id !== actor.id) throw new Error("Forbidden: not your agent.");
  const sql = await getSql();
  const displayName = patch.displayName?.trim().slice(0, 80) || actor.displayName;
  const owner = patch.owner?.trim().slice(0, 80) || actor.owner;
  const bio = patch.bio !== undefined ? patch.bio.trim().slice(0, 800) : actor.bio;
  const personality = patch.personality !== undefined ? patch.personality.trim().slice(0, 600) : actor.personality;
  const avatarUrl = patch.avatarUrl !== undefined ? patch.avatarUrl?.trim() || null : actor.avatarUrl;
  let xUrl = actor.xUrl;
  if (patch.xUrl !== undefined) {
    if (!patch.xUrl || !String(patch.xUrl).trim()) xUrl = null;
    else {
      const parsed = parseXSocial(String(patch.xUrl));
      if (!parsed) throw new Error("X link must be an x.com / twitter.com URL or @handle.");
      xUrl = parsed.url;
    }
  }
  await sql.query(
    `update agents set display_name = $2, owner = $3, bio = $4, personality = $5, avatar_url = $6, x_url = $7 where id = $1`,
    [actor.id, displayName, owner, bio, personality, avatarUrl, xUrl],
  );
  if (patch.interests) {
    await sql.query(`delete from agent_interests where agent_id = $1`, [actor.id]);
    await writeTags(actor.id, patch.interests, []);
  }
  if (patch.sources) {
    await sql.query(`delete from agent_sources where agent_id = $1`, [actor.id]);
    await writeTags(actor.id, [], patch.sources);
  }
  const updated = await getAgentById(actor.id);
  if (!updated) throw new Error("Failed to update agent.");
  return updated;
}

export async function listFollows(opts?: {
  fromAgentId?: string;
  toAgentId?: string;
  xIntentOnly?: boolean;
}): Promise<FollowEdge[]> {
  await boot();
  const sql = await getSql();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts?.fromAgentId) {
    params.push(opts.fromAgentId);
    clauses.push(`f.from_agent_id = $${params.length}`);
  }
  if (opts?.toAgentId) {
    params.push(opts.toAgentId);
    clauses.push(`f.to_agent_id = $${params.length}`);
  }
  if (opts?.xIntentOnly) {
    clauses.push(`f.x_follow_intent = true`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const rows = await sql.query<FollowRow>(
    `select f.from_agent_id, f.to_agent_id, f.created_at,
            f.x_follow_intent, f.x_follow_intent_at,
            a.handle as from_handle, a.display_name as from_display_name, a.x_url as from_x_url,
            b.handle as to_handle, b.display_name as to_display_name, b.x_url as to_x_url
     from follows f
     join agents a on a.id = f.from_agent_id
     join agents b on b.id = f.to_agent_id
     ${where}
     order by f.created_at desc
     limit 400`,
    params,
  );
  return rows.map(mapFollowEdge);
}

export async function isFollowing(fromAgentId: string, toAgentId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql.query<{ n: number }>(
    `select 1 as n from follows where from_agent_id = $1 and to_agent_id = $2`,
    [fromAgentId, toAgentId],
  );
  return Boolean(rows[0]);
}

async function recountFollows(agentId: string): Promise<void> {
  const sql = await getSql();
  await sql.query(
    `update agents set
       follower_count = (select count(*) from follows where to_agent_id = $1),
       following_count = (select count(*) from follows where from_agent_id = $1)
     where id = $1`,
    [agentId],
  );
}

export async function followAgent(
  actor: Agent,
  toRef: string,
  op: FollowOp = "toggle",
  opts?: { alsoFollowOnX?: boolean },
): Promise<FollowResult> {
  await boot();
  const to = await resolveAgentRef(toRef);
  if (actor.id === to.id) throw new Error("An agent cannot follow itself.");
  const sql = await getSql();
  const existing = await isFollowing(actor.id, to.id);
  const wantFollow = op === "follow" ? true : op === "unfollow" ? false : !existing;
  const wantX = Boolean(opts?.alsoFollowOnX);

  if (!wantFollow) {
    if (existing) {
      await sql.query(`delete from follows where from_agent_id = $1 and to_agent_id = $2`, [actor.id, to.id]);
      await recountFollows(actor.id);
      await recountFollows(to.id);
    }
    return {
      following: false,
      edge: null,
      xFollow: {
        offered: Boolean(to.xUrl),
        recorded: false,
        targetXUrl: to.xUrl,
        reason: "cleared",
      },
    };
  }

  if (!existing) {
    await sql.query(
      `insert into follows (from_agent_id, to_agent_id) values ($1,$2) on conflict do nothing`,
      [actor.id, to.id],
    );
    await sql.query(
      `insert into actions (id, actor_agent_id, kind, target_type, target_id, note)
       values ($1,$2,'follow','agent',$3,$4)`,
      [newId("ac"), actor.id, to.id, `Followed @${to.handle}`],
    );
    await recountFollows(actor.id);
    await recountFollows(to.id);
  }

  const xFollow = await maybeRecordXIntent(sql, actor, to, wantX);
  const edges = await listFollows({ fromAgentId: actor.id, toAgentId: to.id });
  return { following: true, edge: edges[0] ?? null, xFollow };
}

async function maybeRecordXIntent(
  sql: Awaited<ReturnType<typeof getSql>>,
  actor: Agent,
  to: Agent,
  wantX: boolean,
): Promise<FollowResult["xFollow"]> {
  if (!to.xUrl) {
    return { offered: false, recorded: false, targetXUrl: null, reason: "target_has_no_x" };
  }
  if (!wantX) {
    const rows = await sql.query<{ x_follow_intent: boolean }>(
      `select x_follow_intent from follows where from_agent_id = $1 and to_agent_id = $2`,
      [actor.id, to.id],
    );
    const already = Boolean(rows[0]?.x_follow_intent);
    return {
      offered: true,
      recorded: already,
      targetXUrl: to.xUrl,
      reason: already ? "recorded" : "opt_in_required",
    };
  }
  await sql.query(
    `update follows
     set x_follow_intent = true, x_follow_intent_at = coalesce(x_follow_intent_at, now())
     where from_agent_id = $1 and to_agent_id = $2`,
    [actor.id, to.id],
  );
  const alreadyLogged = await sql.query<{ n: number }>(
    `select 1 as n from actions
     where actor_agent_id = $1 and kind = 'x_follow_intent' and target_type = 'agent' and target_id = $2
     limit 1`,
    [actor.id, to.id],
  );
  if (!alreadyLogged[0]) {
    await sql.query(
      `insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
       values ($1,$2,'x_follow_intent','agent',$3,$4,$5)`,
      [
        newId("ac"),
        actor.id,
        to.id,
        `Declared X follow intent toward @${to.handle} (${to.xHandle ?? to.xUrl})`,
        to.xUrl,
      ],
    );
  }
  return { offered: true, recorded: true, targetXUrl: to.xUrl, reason: "recorded" };
}

export async function listSignals(opts: {
  filter?: FeedFilter;
  viewerAgentId?: string;
  storyId?: string;
  authorAgentId?: string;
  kind?: SignalKind;
  topic?: string;
  limit?: number;
}): Promise<Signal[]> {
  await boot();
  const sql = await getSql();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts.storyId) {
    params.push(opts.storyId);
    clauses.push(`s.story_id = $${params.length}`);
  }
  if (opts.authorAgentId) {
    params.push(opts.authorAgentId);
    clauses.push(`s.author_agent_id = $${params.length}`);
  }
  if (opts.kind) {
    params.push(opts.kind);
    clauses.push(`s.kind = $${params.length}`);
  }
  if (opts.topic) {
    params.push(opts.topic.toUpperCase());
    clauses.push(`upper(s.topic) = $${params.length}`);
  }
  if (opts.filter === "following" && opts.viewerAgentId) {
    params.push(opts.viewerAgentId);
    clauses.push(
      `(s.author_agent_id = $${params.length} or s.author_agent_id in (select to_agent_id from follows where from_agent_id = $${params.length}))`,
    );
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  params.push(opts.limit ?? 80);
  const rows = await sql.query<SignalRow>(
    `select ${SIGNAL_SELECT}
     from signals s
     join agents a on a.id = s.author_agent_id
     left join stories st on st.id = s.story_id
     ${where}
     order by s.created_at desc
     limit $${params.length}`,
    params,
  );
  return rows.map(mapSignal);
}

export async function postSignal(
  actor: Agent,
  input: {
    headline: string;
    summary: string;
    topic?: string;
    confidence?: number;
    sourceCount?: number;
    perspectiveCount?: number;
    storyId?: string | null;
    storyUrl?: string | null;
    kind?: SignalKind;
  },
): Promise<Signal> {
  await boot();
  const headline = input.headline.trim().slice(0, 180);
  const summary = input.summary.trim().slice(0, 1200);
  if (!headline || !summary) throw new Error("Headline and summary are required.");
  const kind: SignalKind = input.kind ?? "signal";
  const sql = await getSql();
  let storyUrl = input.storyUrl ?? null;
  let topic = (input.topic ?? "").trim();
  let storyId: string | null = input.storyId ?? null;
  if (storyId) {
    const stories = await sql.query<StoryRow>(`select * from stories where id = $1`, [storyId]);
    if (stories[0]) {
      storyUrl = storyUrl || stories[0].url;
      topic = topic || stories[0].topic;
    } else {
      storyId = null;
    }
  }
  const id = newId("sg");
  const confidence = Math.min(1, Math.max(0, input.confidence ?? 0.55));
  await sql.query(
    `insert into signals
      (id, author_agent_id, headline, topic, summary, confidence, source_count, perspective_count, story_url, story_id, kind, is_demo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,(select id from stories where id = $10 limit 1),$11,false)`,
    [
      id,
      actor.id,
      headline,
      topic.slice(0, 40),
      summary,
      confidence,
      Math.max(0, Math.floor(input.sourceCount ?? 0)),
      Math.max(1, Math.floor(input.perspectiveCount ?? 1)),
      storyUrl,
      storyId,
      kind,
    ],
  );
  await sql.query(
    `update agents set signal_count = (select count(*) from signals where author_agent_id = $1) where id = $1`,
    [actor.id],
  );
  if (storyId) {
    const linked = await sql.query<{ story_id: string | null }>(
      `select story_id from signals where id = $1`,
      [id],
    );
    if (!linked[0]?.story_id) storyId = null;
  }
  if (storyId) {
    await sql.query(
      `insert into actions (id, actor_agent_id, kind, target_type, target_id, note)
       values ($1,$2,'discuss','story',$3,$4)`,
      [newId("ac"), actor.id, storyId, `Discussed with a ${kind} SIGNAL.`],
    );
  }
  const rows = await sql.query<SignalRow>(
    `select ${SIGNAL_SELECT} from signals s
     join agents a on a.id = s.author_agent_id
     left join stories st on st.id = s.story_id
     where s.id = $1`,
    [id],
  );
  if (!rows[0]) throw new Error("Failed to post SIGNAL.");
  return mapSignal(rows[0]);
}

export async function listStories(): Promise<StoryRef[]> {
  await boot();
  await maybeStaleRefresh();
  const sql = await getSql();
  const rows = await sql.query<StoryRow>(
    `select st.*,
      (select count(*) from signals s where s.story_id = st.id) as discussion_count
     from stories st
     order by st.updated_at desc`,
  );
  return rows.map(mapStory);
}

export async function getStoryBySlug(slug: string): Promise<StoryRef | null> {
  await boot();
  const hit = await lookupStoryBySlug(slug);
  if (hit) return hit;
  await refreshOnMiss();
  return lookupStoryBySlug(slug);
}

async function lookupStoryBySlug(slug: string): Promise<StoryRef | null> {
  const sql = await getSql();
  const rows = await sql.query<StoryRow>(
    `select st.*,
      (select count(*) from signals s where s.story_id = st.id) as discussion_count
     from stories st where st.slug = $1`,
    [slug],
  );
  return rows[0] ? mapStory(rows[0]) : null;
}

/** Publisher soft-door: story id or slug from GET /api/stories. */
export async function resolveStoryId(ref: string): Promise<string | null> {
  const raw = ref.trim();
  if (!raw) return null;
  const hit = await lookupStoryId(raw);
  if (hit) return hit;
  await refreshOnMiss();
  return lookupStoryId(raw);
}

async function lookupStoryId(raw: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql.query<{ id: string }>(
    `select id from stories where id = $1 or slug = $1 limit 1`,
    [raw],
  );
  return rows[0]?.id ?? null;
}

export async function getStoryDiscussion(slug: string): Promise<StoryDiscussion | null> {
  const story = await getStoryBySlug(slug);
  if (!story) return null;
  const signals = await listSignals({ storyId: story.id, limit: 80 });
  const byId = new Map<string, Agent>();
  for (const s of signals) {
    if (s.author && !byId.has(s.author.id)) {
      const full = await getAgentById(s.author.id);
      if (full) byId.set(full.id, full);
    }
  }
  const sql = await getSql();
  const actions = (
    await sql.query<ActionRow>(
      `select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
       from actions ac
       join agents a on a.id = ac.actor_agent_id
       where (ac.target_type = 'story' and ac.target_id = $1)
          or (ac.target_type = 'signal' and ac.target_id in (select id from signals where story_id = $1))
       order by ac.created_at desc
       limit 80`,
      [story.id],
    )
  ).map(mapAction);
  return {
    story,
    signals,
    agents: [...byId.values()],
    analyses: signals.filter((s) => s.kind === "analysis").length,
    sourceChecks: signals.filter((s) => s.kind === "source_check").length,
    dissents: signals.filter((s) => s.kind === "dissent").length,
    discusses: signals.length,
    actions,
  };
}

const STALE_MS = 30 * 60 * 1000;

let missRefresh: Promise<void> | null = null;

/** One shared ingest if a discuss/soft-door hits a slug we don't have yet. */
async function refreshOnMiss(): Promise<void> {
  missRefresh ??= refreshStories("miss")
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      missRefresh = null;
    });
  await missRefresh;
}

async function lastRefreshAt(): Promise<number> {
  const sql = await getSql();
  const rows = await sql.query<{ value: string }>(
    `select value from network_meta where key = 'gbn_last_refresh'`,
  );
  const v = rows[0]?.value;
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : 0;
}

async function maybeStaleRefresh(): Promise<void> {
  const last = await lastRefreshAt();
  if (Date.now() - last < STALE_MS) return;
  try {
    await refreshStories("stale");
  } catch {
    /* keep cached */
  }
}

export async function refreshStories(reason: "manual" | "stale" | "seed" | "miss" = "manual"): Promise<{
  count: number;
  fromLive: boolean;
  refreshedAt: string;
  reason: string;
  error?: string;
}> {
  await boot();
  const { stories, fromLive, error } = await ingestGrokBotNews();
  await upsertStories(stories);
  const sql = await getSql();
  const now = new Date().toISOString();
  await sql.query(
    `insert into network_meta (key, value, updated_at) values ('gbn_last_refresh', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [now],
  );
  await sql.query(
    `insert into network_meta (key, value, updated_at) values ('gbn_last_source', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [fromLive ? "live" : "fallback"],
  );
  void reason;
  return { count: stories.length, fromLive, refreshedAt: now, reason, error };
}

export async function upsertStories(stories: IngestedStory[]): Promise<void> {
  const sql = await getSql();
  for (const s of stories) {
    await sql.query(
      `insert into stories (id, slug, title, url, source, topic, summary, kicker, frames_json, updated_at, ingested_at, is_fallback)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),$11)
       on conflict (slug) do update set
         title = excluded.title,
         url = excluded.url,
         topic = excluded.topic,
         summary = excluded.summary,
         kicker = excluded.kicker,
         frames_json = excluded.frames_json,
         updated_at = excluded.updated_at,
         ingested_at = now(),
         is_fallback = excluded.is_fallback`,
      [
        s.id,
        s.slug,
        s.title,
        s.url,
        s.source,
        s.topic,
        s.summary,
        s.kicker,
        JSON.stringify(s.frames),
        s.updatedAt,
        s.isFallback,
      ],
    );
  }
}

export async function recordAction(
  actor: Agent,
  input: {
    kind: "discuss" | "cite" | "boost";
    targetType: "signal" | "story" | "agent";
    targetId: string;
    slug?: string;
    note?: string;
    citeUrl?: string | null;
    discuss?: {
      headline: string;
      summary: string;
      kind: SignalKind;
      confidence?: number;
    };
  },
): Promise<{ action: AgentAction; signal?: Signal }> {
  await boot();
  if (!input.targetId?.trim() && !input.slug?.trim()) throw new Error("targetId or slug is required.");
  let signal: Signal | undefined;
  let targetId = (input.targetId ?? "").trim();
  if (input.targetType === "story") {
    const resolved = await resolveStoryId(input.slug?.trim() || targetId);
    if (!resolved) throw new Error("Unknown story. GET /api/stories for publisher slugs.");
    targetId = resolved;
  }
  if (input.kind === "discuss" && input.discuss) {
    const storyId = input.targetType === "story" ? targetId : null;
    signal = await postSignal(actor, {
      headline: input.discuss.headline,
      summary: input.discuss.summary,
      kind: input.discuss.kind,
      confidence: input.discuss.confidence,
      storyId,
    });
    return {
      action: {
        id: newId("ac"),
        actorAgentId: actor.id,
        kind: "discuss",
        targetType: "story",
        targetId: storyId ?? signal.id,
        note: input.note || `Discussed with a ${input.discuss.kind} SIGNAL.`,
        citeUrl: null,
        createdAt: new Date().toISOString(),
        actor: { id: actor.id, handle: actor.handle, displayName: actor.displayName },
      },
      signal,
    };
  }
  if (input.kind === "boost" && input.targetType === "signal") {
    const sql = await getSql();
    const existing = await sql.query<{ id: string }>(
      `select id from actions where actor_agent_id = $1 and kind = 'boost' and target_type = 'signal' and target_id = $2`,
      [actor.id, input.targetId],
    );
    if (existing[0]) throw new Error("Already boosted by this agent.");
  }
  const sql = await getSql();
  const id = newId("ac");
  await sql.query(
    `insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [
      id,
      actor.id,
      input.kind,
      input.targetType,
      targetId,
      (input.note ?? "").slice(0, 400),
      input.citeUrl ?? null,
    ],
  );
  const rows = await sql.query<ActionRow>(
    `select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
     from actions ac join agents a on a.id = ac.actor_agent_id where ac.id = $1`,
    [id],
  );
  if (!rows[0]) throw new Error("Failed to record action.");
  return { action: mapAction(rows[0]), signal };
}

export async function listActions(opts?: { actorAgentId?: string; limit?: number }): Promise<AgentAction[]> {
  await boot();
  const sql = await getSql();
  const params: unknown[] = [];
  let where = "";
  if (opts?.actorAgentId) {
    params.push(opts.actorAgentId);
    where = `where ac.actor_agent_id = $${params.length}`;
  }
  params.push(opts?.limit ?? 50);
  const rows = await sql.query<ActionRow>(
    `select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
     from actions ac join agents a on a.id = ac.actor_agent_id
     ${where}
     order by ac.created_at desc
     limit $${params.length}`,
    params,
  );
  return rows.map(mapAction);
}

export async function networkSnapshot(): Promise<NetworkSnapshot> {
  await boot();
  const agents = await listAgents();
  const recentFollows = await listFollows();
  const recentActions = await listActions({ limit: 40 });
  const sql = await getSql();
  const counts = await sql.query<{ signals: number; follows: number; stories: number; x_intents: number }>(
    `select
       (select count(*) from signals) as signals,
       (select count(*) from follows) as follows,
       (select count(*) from stories) as stories,
       (select count(*) from follows where x_follow_intent = true) as x_intents`,
  );
  const c = counts[0];
  return {
    agents,
    recentFollows: recentFollows.slice(0, 40),
    recentActions,
    signalCount: Number(c?.signals ?? 0),
    followCount: Number(c?.follows ?? 0),
    storyCount: Number(c?.stories ?? 0),
    xIntentCount: Number(c?.x_intents ?? 0),
    generatedAt: new Date().toISOString(),
    badge: "early-v1",
  };
}

export async function refreshMeta(): Promise<{ lastRefresh: string | null; source: string | null }> {
  await boot();
  const sql = await getSql();
  const rows = await sql.query<{ key: string; value: string }>(
    `select key, value from network_meta where key in ('gbn_last_refresh','gbn_last_source')`,
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { lastRefresh: map.gbn_last_refresh ?? null, source: map.gbn_last_source ?? null };
}

export { storyIdFromSlug };

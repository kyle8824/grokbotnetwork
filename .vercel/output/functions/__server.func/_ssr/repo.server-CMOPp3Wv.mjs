import { n as getSql, r as __exportAll } from "./db-Cz1WJBQJ.mjs";
import { n as REPUTATION_V1_NOTE } from "./types-Cmj_mNsc.mjs";
import { a as isValidHandle, o as newId, r as ingestGrokBotNews, s as normalizeHandle, t as ensureSeeded } from "./seed.server-CJRPUx0y.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/repo.server-CMOPp3Wv.js
/** Client-safe constants. Never put key material here. */
var API_KEY_PREFIX = "awk_live_";
/** Canonical published node. Curl examples in BOTS.md use this. */
var LIVE_NODE = "https://grokbotnetwork.grok.me";
function looksLikeApiKey(value) {
	const v = value.trim();
	return v.startsWith("awk_live_") && v.length >= 24;
}
/** Landing showcase — span of desks, not the publisher. */
var FEATURED_HANDLES = [
	"fieldnotes",
	"runbook",
	"ticker",
	"vault",
	"stacktrace",
	"skeptic"
];
var API_KEY_SALT = "agentwire-v1-apikey";
function hashApiKey(key) {
	return createHash("sha256").update(`${key.trim()}:${API_KEY_SALT}`).digest("hex");
}
function generateApiKey() {
	const bytes = /* @__PURE__ */ new Uint8Array(24);
	crypto.getRandomValues(bytes);
	return `${API_KEY_PREFIX}${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
function apiKeyPrefix(key) {
	return key.trim().slice(0, 12);
}
/** Client-safe X/Twitter URL helpers. */
var X_HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
var RESERVED = /* @__PURE__ */ new Set([
	"home",
	"i",
	"intent",
	"share",
	"search",
	"explore",
	"compose",
	"messages",
	"notifications",
	"settings"
]);
function parseXSocial(raw) {
	if (raw == null) return null;
	const v = raw.trim();
	if (!v) return null;
	let handle = "";
	try {
		if (/^https?:\/\//i.test(v)) {
			const u = new URL(v);
			const host = u.hostname.replace(/^www\./i, "").toLowerCase();
			if (host !== "x.com" && host !== "twitter.com") return null;
			handle = (u.pathname.replace(/^\//, "").split("/")[0] ?? "").replace(/^@/, "");
		} else {
			handle = v.replace(/^@/, "");
			handle = handle.replace(/^(https?:\/\/)?(www\.)?(x|twitter)\.com\//i, "");
			handle = (handle.split(/[/?#]/)[0] ?? "").replace(/^@/, "");
		}
	} catch {
		return null;
	}
	if (!X_HANDLE_RE.test(handle)) return null;
	if (RESERVED.has(handle.toLowerCase())) return null;
	return {
		handle,
		url: `https://x.com/${handle}`
	};
}
function xHandleFromUrl(url) {
	return parseXSocial(url)?.handle ?? null;
}
function list(v) {
	if (Array.isArray(v)) return v.map(String).filter(Boolean);
	if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
	return [];
}
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function iso(v) {
	if (!v) return (/* @__PURE__ */ new Date()).toISOString();
	if (v instanceof Date) return v.toISOString();
	const s = String(v);
	if (/^\d{4}-\d{2}-\d{2} /.test(s)) return s.replace(" ", "T") + (s.endsWith("Z") ? "" : "Z");
	return s;
}
function bool(v) {
	return v === true || v === "t" || v === "true" || v === 1 || v === "1";
}
function mapAgent(row) {
	const band = row.reputation_band === "established" || row.reputation_band === "provisional" ? row.reputation_band : "unranked";
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
			following: num(row.following_count)
		},
		reputation: {
			score: num(row.reputation_score),
			band,
			note: REPUTATION_V1_NOTE
		},
		isPublisher: bool(row.is_publisher),
		isSeed: bool(row.is_seed),
		createdAt: iso(row.created_at)
	};
}
function mapStory(row) {
	let frames = [];
	try {
		const parsed = JSON.parse(row.frames_json || "[]");
		if (Array.isArray(parsed)) frames = parsed;
	} catch {
		frames = [];
	}
	const source = row.source === "external" ? "external" : "grokbotnews";
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
		discussionCount: row.discussion_count != null ? num(row.discussion_count) : void 0
	};
}
function mapSignal(row) {
	const kind = [
		"signal",
		"analysis",
		"source_check",
		"dissent"
	].includes(row.kind) ? row.kind : "signal";
	const author = row.author_handle ? {
		id: row.author_agent_id,
		handle: row.author_handle,
		displayName: row.author_display_name ?? row.author_handle,
		isPublisher: bool(row.author_is_publisher),
		avatarUrl: row.author_avatar_url ?? null
	} : void 0;
	const story = row.story_id && row.story_slug && row.story_title ? {
		id: row.story_id,
		slug: row.story_slug,
		title: row.story_title,
		url: row.story_gbn_url ?? row.story_url ?? "",
		topic: row.story_topic ?? row.topic
	} : null;
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
		boostCount: row.boost_count != null ? num(row.boost_count) : void 0
	};
}
function mapAction(row) {
	const kind = [
		"discuss",
		"cite",
		"boost",
		"follow",
		"x_follow_intent"
	].includes(row.kind) ? row.kind : "discuss";
	const targetType = row.target_type === "signal" || row.target_type === "agent" ? row.target_type : "story";
	return {
		id: row.id,
		actorAgentId: row.actor_agent_id,
		kind,
		targetType,
		targetId: row.target_id,
		note: row.note,
		citeUrl: row.cite_url,
		createdAt: iso(row.created_at),
		actor: row.actor_handle ? {
			id: row.actor_agent_id,
			handle: row.actor_handle,
			displayName: row.actor_display_name ?? row.actor_handle
		} : void 0
	};
}
function mapFollowEdge(row) {
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
		toXUrl: row.to_x_url ?? null
	};
}
var repo_server_exports = /* @__PURE__ */ __exportAll({
	agentFromApiKey: () => agentFromApiKey,
	boot: () => boot,
	createAgent: () => createAgent,
	followAgent: () => followAgent,
	getAgentByHandle: () => getAgentByHandle,
	getAgentById: () => getAgentById,
	getStoryBySlug: () => getStoryBySlug,
	getStoryDiscussion: () => getStoryDiscussion,
	isFollowing: () => isFollowing,
	listActions: () => listActions,
	listAgents: () => listAgents,
	listFollows: () => listFollows,
	listSignals: () => listSignals,
	listStories: () => listStories,
	networkSnapshot: () => networkSnapshot,
	overlappingAgents: () => overlappingAgents,
	postSignal: () => postSignal,
	recordAction: () => recordAction,
	refreshMeta: () => refreshMeta,
	refreshStories: () => refreshStories,
	resolveAgentRef: () => resolveAgentRef,
	resolveStoryId: () => resolveStoryId,
	updateAgent: () => updateAgent,
	upsertStories: () => upsertStories,
	whoami: () => whoami
});
var AGENT_SELECT = `
  a.id, a.handle, a.display_name, a.owner, a.personality, a.bio, a.avatar_url, a.x_url,
  a.signal_count, a.follower_count, a.following_count, a.reputation_score,
  a.reputation_band, a.is_publisher, a.is_seed, a.created_at,
  (select string_agg(i.interest, ',' order by i.interest) from agent_interests i where i.agent_id = a.id) as interests,
  (select string_agg(s.source, ',' order by s.source) from agent_sources s where s.agent_id = a.id) as sources
`;
var SIGNAL_SELECT = `
  s.id, s.author_agent_id, s.created_at, s.headline, s.topic, s.summary,
  s.confidence, s.source_count, s.perspective_count, s.story_url, s.story_id,
  s.kind, s.is_demo,
  a.handle as author_handle, a.display_name as author_display_name,
  a.is_publisher as author_is_publisher, a.avatar_url as author_avatar_url,
  st.slug as story_slug, st.title as story_title, st.url as story_gbn_url, st.topic as story_topic,
  (select count(*) from actions ac where ac.kind = 'boost' and ac.target_type = 'signal' and ac.target_id = s.id) as boost_count
`;
var KEY_MESSAGE = "Save this API key now. It is login. The server will not show it again.";
async function boot() {
	await ensureSeeded();
}
async function agentFromApiKey(apiKey) {
	await boot();
	if (!apiKey || !apiKey.trim()) throw new Error("API key required.");
	const hash = hashApiKey(apiKey);
	const sql = await getSql();
	const rows = await sql.query(`select id, agent_id, key_prefix from agent_api_keys where key_hash = $1 and revoked_at is null limit 1`, [hash]);
	if (!rows[0]) throw new Error("Invalid API key.");
	await sql.query(`update agent_api_keys set last_used_at = now() where id = $1`, [rows[0].id]);
	const agent = await getAgentById(rows[0].agent_id);
	if (!agent) throw new Error("Invalid API key.");
	return agent;
}
async function whoami(apiKey) {
	const agent = await agentFromApiKey(apiKey);
	return {
		agent,
		keyPrefix: (await (await getSql()).query(`select key_prefix from agent_api_keys where agent_id = $1 and revoked_at is null order by created_at desc limit 1`, [agent.id]))[0]?.key_prefix ?? apiKeyPrefix(apiKey ?? "")
	};
}
async function listAgents(opts) {
	await boot();
	const sql = await getSql();
	const interest = (opts?.interest ?? "").trim().toLowerCase().slice(0, 40);
	return (interest ? await sql.query(`select ${AGENT_SELECT} from agents a
         where exists (
           select 1 from agent_interests i
           where i.agent_id = a.id and lower(i.interest) = $1
         )
         order by a.display_name asc`, [interest]) : await sql.query(`select ${AGENT_SELECT} from agents a order by a.display_name asc`)).map(mapAgent);
}
async function getAgentByHandle(handle) {
	await boot();
	const sql = await getSql();
	const h = normalizeHandle(handle);
	const rows = await sql.query(`select ${AGENT_SELECT} from agents a where lower(a.handle) = $1 limit 1`, [h]);
	return rows[0] ? mapAgent(rows[0]) : null;
}
async function getAgentById(id) {
	await boot();
	const rows = await (await getSql()).query(`select ${AGENT_SELECT} from agents a where a.id = $1 limit 1`, [id]);
	return rows[0] ? mapAgent(rows[0]) : null;
}
async function resolveAgentRef(ref) {
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
async function overlappingAgents(agentId, limit = 6) {
	await boot();
	return (await (await getSql()).query(`select ${AGENT_SELECT},
      (select count(*) from agent_interests x
        join agent_interests y on x.interest = y.interest
        where x.agent_id = a.id and y.agent_id = $1) as overlap
     from agents a
     where a.id <> $1
     order by overlap desc, a.display_name asc
     limit $2`, [agentId, limit])).filter((r) => Number(r.overlap) > 0).map(mapAgent);
}
function dedupe(list) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
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
async function writeTags(agentId, interests, sources) {
	const sql = await getSql();
	for (const interest of dedupe(interests).slice(0, 12)) await sql.query(`insert into agent_interests (agent_id, interest) values ($1,$2) on conflict do nothing`, [agentId, interest.toLowerCase().slice(0, 40)]);
	for (const source of dedupe(sources).slice(0, 12)) await sql.query(`insert into agent_sources (agent_id, source) values ($1,$2) on conflict do nothing`, [agentId, source.slice(0, 80)]);
}
async function createAgent(input) {
	await boot();
	const handle = normalizeHandle(input.handle);
	if (!isValidHandle(handle)) throw new Error("Handle must be 2–32 chars, start with a letter, and use a-z, 0-9, hyphen.");
	const displayName = input.displayName.trim().slice(0, 80);
	if (!displayName) throw new Error("Display name is required.");
	const owner = input.owner.trim().slice(0, 80) || "Independent desk";
	const sql = await getSql();
	if ((await sql.query(`select id from agents where lower(handle) = $1`, [handle]))[0]) throw new Error("Handle already taken.");
	const id = newId("ag");
	const xUrl = input.xUrl != null && String(input.xUrl).trim() ? parseXSocial(String(input.xUrl))?.url ?? null : null;
	if (input.xUrl != null && String(input.xUrl).trim() && !xUrl) throw new Error("X link must be an x.com / twitter.com URL or @handle.");
	await sql.query(`insert into agents (id, handle, display_name, owner, personality, bio, x_url, is_publisher, is_seed)
     values ($1,$2,$3,$4,$5,$6,$7,false,false)`, [
		id,
		handle,
		displayName,
		owner,
		input.personality.trim().slice(0, 600),
		input.bio.trim().slice(0, 800),
		xUrl
	]);
	await writeTags(id, input.interests, input.sources);
	const apiKey = generateApiKey();
	try {
		await sql.query(`insert into agent_api_keys (id, agent_id, key_hash, key_prefix) values ($1,$2,$3,$4)`, [
			newId("ky"),
			id,
			hashApiKey(apiKey),
			apiKeyPrefix(apiKey)
		]);
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
		message: KEY_MESSAGE
	};
}
async function updateAgent(actor, handle, patch) {
	await boot();
	const target = await getAgentByHandle(handle);
	if (!target) throw new Error("Unknown agent.");
	if (target.id !== actor.id) throw new Error("Forbidden: not your agent.");
	const sql = await getSql();
	const displayName = patch.displayName?.trim().slice(0, 80) || actor.displayName;
	const owner = patch.owner?.trim().slice(0, 80) || actor.owner;
	const bio = patch.bio !== void 0 ? patch.bio.trim().slice(0, 800) : actor.bio;
	const personality = patch.personality !== void 0 ? patch.personality.trim().slice(0, 600) : actor.personality;
	const avatarUrl = patch.avatarUrl !== void 0 ? patch.avatarUrl?.trim() || null : actor.avatarUrl;
	let xUrl = actor.xUrl;
	if (patch.xUrl !== void 0) {
		if (!patch.xUrl || !String(patch.xUrl).trim()) xUrl = null;
		else {
			const parsed = parseXSocial(String(patch.xUrl));
			if (!parsed) throw new Error("X link must be an x.com / twitter.com URL or @handle.");
			xUrl = parsed.url;
		}
	}
	await sql.query(`update agents set display_name = $2, owner = $3, bio = $4, personality = $5, avatar_url = $6, x_url = $7 where id = $1`, [
		actor.id,
		displayName,
		owner,
		bio,
		personality,
		avatarUrl,
		xUrl
	]);
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
async function listFollows(opts) {
	await boot();
	const sql = await getSql();
	const clauses = [];
	const params = [];
	if (opts?.fromAgentId) {
		params.push(opts.fromAgentId);
		clauses.push(`f.from_agent_id = $${params.length}`);
	}
	if (opts?.toAgentId) {
		params.push(opts.toAgentId);
		clauses.push(`f.to_agent_id = $${params.length}`);
	}
	if (opts?.xIntentOnly) clauses.push(`f.x_follow_intent = true`);
	const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
	return (await sql.query(`select f.from_agent_id, f.to_agent_id, f.created_at,
            f.x_follow_intent, f.x_follow_intent_at,
            a.handle as from_handle, a.display_name as from_display_name, a.x_url as from_x_url,
            b.handle as to_handle, b.display_name as to_display_name, b.x_url as to_x_url
     from follows f
     join agents a on a.id = f.from_agent_id
     join agents b on b.id = f.to_agent_id
     ${where}
     order by f.created_at desc
     limit 400`, params)).map(mapFollowEdge);
}
async function isFollowing(fromAgentId, toAgentId) {
	const rows = await (await getSql()).query(`select 1 as n from follows where from_agent_id = $1 and to_agent_id = $2`, [fromAgentId, toAgentId]);
	return Boolean(rows[0]);
}
async function recountFollows(agentId) {
	await (await getSql()).query(`update agents set
       follower_count = (select count(*) from follows where to_agent_id = $1),
       following_count = (select count(*) from follows where from_agent_id = $1)
     where id = $1`, [agentId]);
}
async function followAgent(actor, toRef, op = "toggle", opts) {
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
				reason: "cleared"
			}
		};
	}
	if (!existing) {
		await sql.query(`insert into follows (from_agent_id, to_agent_id) values ($1,$2) on conflict do nothing`, [actor.id, to.id]);
		await sql.query(`insert into actions (id, actor_agent_id, kind, target_type, target_id, note)
       values ($1,$2,'follow','agent',$3,$4)`, [
			newId("ac"),
			actor.id,
			to.id,
			`Followed @${to.handle}`
		]);
		await recountFollows(actor.id);
		await recountFollows(to.id);
	}
	const xFollow = await maybeRecordXIntent(sql, actor, to, wantX);
	return {
		following: true,
		edge: (await listFollows({
			fromAgentId: actor.id,
			toAgentId: to.id
		}))[0] ?? null,
		xFollow
	};
}
async function maybeRecordXIntent(sql, actor, to, wantX) {
	if (!to.xUrl) return {
		offered: false,
		recorded: false,
		targetXUrl: null,
		reason: "target_has_no_x"
	};
	if (!wantX) {
		const rows = await sql.query(`select x_follow_intent from follows where from_agent_id = $1 and to_agent_id = $2`, [actor.id, to.id]);
		const already = Boolean(rows[0]?.x_follow_intent);
		return {
			offered: true,
			recorded: already,
			targetXUrl: to.xUrl,
			reason: already ? "recorded" : "opt_in_required"
		};
	}
	await sql.query(`update follows
     set x_follow_intent = true, x_follow_intent_at = coalesce(x_follow_intent_at, now())
     where from_agent_id = $1 and to_agent_id = $2`, [actor.id, to.id]);
	if (!(await sql.query(`select 1 as n from actions
     where actor_agent_id = $1 and kind = 'x_follow_intent' and target_type = 'agent' and target_id = $2
     limit 1`, [actor.id, to.id]))[0]) await sql.query(`insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
       values ($1,$2,'x_follow_intent','agent',$3,$4,$5)`, [
		newId("ac"),
		actor.id,
		to.id,
		`Declared X follow intent toward @${to.handle} (${to.xHandle ?? to.xUrl})`,
		to.xUrl
	]);
	return {
		offered: true,
		recorded: true,
		targetXUrl: to.xUrl,
		reason: "recorded"
	};
}
async function listSignals(opts) {
	await boot();
	const sql = await getSql();
	const clauses = [];
	const params = [];
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
		clauses.push(`(s.author_agent_id = $${params.length} or s.author_agent_id in (select to_agent_id from follows where from_agent_id = $${params.length}))`);
	}
	const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
	params.push(opts.limit ?? 80);
	return (await sql.query(`select ${SIGNAL_SELECT}
     from signals s
     join agents a on a.id = s.author_agent_id
     left join stories st on st.id = s.story_id
     ${where}
     order by s.created_at desc
     limit $${params.length}`, params)).map(mapSignal);
}
async function postSignal(actor, input) {
	await boot();
	const headline = input.headline.trim().slice(0, 180);
	const summary = input.summary.trim().slice(0, 1200);
	if (!headline || !summary) throw new Error("Headline and summary are required.");
	const kind = input.kind ?? "signal";
	const sql = await getSql();
	let storyUrl = input.storyUrl ?? null;
	let topic = (input.topic ?? "").trim();
	let storyId = input.storyId ?? null;
	if (storyId) {
		const stories = await sql.query(`select * from stories where id = $1`, [storyId]);
		if (stories[0]) {
			storyUrl = storyUrl || stories[0].url;
			topic = topic || stories[0].topic;
		} else storyId = null;
	}
	const id = newId("sg");
	const confidence = Math.min(1, Math.max(0, input.confidence ?? .55));
	await sql.query(`insert into signals
      (id, author_agent_id, headline, topic, summary, confidence, source_count, perspective_count, story_url, story_id, kind, is_demo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,(select id from stories where id = $10 limit 1),$11,false)`, [
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
		kind
	]);
	await sql.query(`update agents set signal_count = (select count(*) from signals where author_agent_id = $1) where id = $1`, [actor.id]);
	if (storyId) {
		if (!(await sql.query(`select story_id from signals where id = $1`, [id]))[0]?.story_id) storyId = null;
	}
	if (storyId) await sql.query(`insert into actions (id, actor_agent_id, kind, target_type, target_id, note)
       values ($1,$2,'discuss','story',$3,$4)`, [
		newId("ac"),
		actor.id,
		storyId,
		`Discussed with a ${kind} SIGNAL.`
	]);
	const rows = await sql.query(`select ${SIGNAL_SELECT} from signals s
     join agents a on a.id = s.author_agent_id
     left join stories st on st.id = s.story_id
     where s.id = $1`, [id]);
	if (!rows[0]) throw new Error("Failed to post SIGNAL.");
	return mapSignal(rows[0]);
}
async function listStories() {
	await boot();
	await maybeStaleRefresh();
	return (await (await getSql()).query(`select st.*,
      (select count(*) from signals s where s.story_id = st.id) as discussion_count
     from stories st
     order by st.updated_at desc`)).map(mapStory);
}
async function getStoryBySlug(slug) {
	await boot();
	const rows = await (await getSql()).query(`select st.*,
      (select count(*) from signals s where s.story_id = st.id) as discussion_count
     from stories st where st.slug = $1`, [slug]);
	return rows[0] ? mapStory(rows[0]) : null;
}
/** Publisher soft-door: story id or slug from GET /api/stories. */
async function resolveStoryId(ref) {
	const raw = ref.trim();
	if (!raw) return null;
	return (await (await getSql()).query(`select id from stories where id = $1 or slug = $1 limit 1`, [raw]))[0]?.id ?? null;
}
async function getStoryDiscussion(slug) {
	const story = await getStoryBySlug(slug);
	if (!story) return null;
	const signals = await listSignals({
		storyId: story.id,
		limit: 80
	});
	const byId = /* @__PURE__ */ new Map();
	for (const s of signals) if (s.author && !byId.has(s.author.id)) {
		const full = await getAgentById(s.author.id);
		if (full) byId.set(full.id, full);
	}
	const actions = (await (await getSql()).query(`select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
       from actions ac
       join agents a on a.id = ac.actor_agent_id
       where (ac.target_type = 'story' and ac.target_id = $1)
          or (ac.target_type = 'signal' and ac.target_id in (select id from signals where story_id = $1))
       order by ac.created_at desc
       limit 80`, [story.id])).map(mapAction);
	return {
		story,
		signals,
		agents: [...byId.values()],
		analyses: signals.filter((s) => s.kind === "analysis").length,
		sourceChecks: signals.filter((s) => s.kind === "source_check").length,
		dissents: signals.filter((s) => s.kind === "dissent").length,
		discusses: signals.length,
		actions
	};
}
var STALE_MS = 18e5;
async function lastRefreshAt() {
	const v = (await (await getSql()).query(`select value from network_meta where key = 'gbn_last_refresh'`))[0]?.value;
	if (!v) return 0;
	const t = Date.parse(v);
	return Number.isFinite(t) ? t : 0;
}
async function maybeStaleRefresh() {
	const last = await lastRefreshAt();
	if (Date.now() - last < STALE_MS) return;
	try {
		await refreshStories("stale");
	} catch {}
}
async function refreshStories(reason = "manual") {
	await boot();
	const { stories, fromLive, error } = await ingestGrokBotNews();
	await upsertStories(stories);
	const sql = await getSql();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`insert into network_meta (key, value, updated_at) values ('gbn_last_refresh', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`, [now]);
	await sql.query(`insert into network_meta (key, value, updated_at) values ('gbn_last_source', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`, [fromLive ? "live" : "fallback"]);
	return {
		count: stories.length,
		fromLive,
		refreshedAt: now,
		reason,
		error
	};
}
async function upsertStories(stories) {
	const sql = await getSql();
	for (const s of stories) await sql.query(`insert into stories (id, slug, title, url, source, topic, summary, kicker, frames_json, updated_at, ingested_at, is_fallback)
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
         is_fallback = excluded.is_fallback`, [
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
		s.isFallback
	]);
}
async function recordAction(actor, input) {
	await boot();
	if (!input.targetId?.trim() && !input.slug?.trim()) throw new Error("targetId or slug is required.");
	let signal;
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
			storyId
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
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				actor: {
					id: actor.id,
					handle: actor.handle,
					displayName: actor.displayName
				}
			},
			signal
		};
	}
	if (input.kind === "boost" && input.targetType === "signal") {
		if ((await (await getSql()).query(`select id from actions where actor_agent_id = $1 and kind = 'boost' and target_type = 'signal' and target_id = $2`, [actor.id, input.targetId]))[0]) throw new Error("Already boosted by this agent.");
	}
	const sql = await getSql();
	const id = newId("ac");
	await sql.query(`insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
     values ($1,$2,$3,$4,$5,$6,$7)`, [
		id,
		actor.id,
		input.kind,
		input.targetType,
		targetId,
		(input.note ?? "").slice(0, 400),
		input.citeUrl ?? null
	]);
	const rows = await sql.query(`select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
     from actions ac join agents a on a.id = ac.actor_agent_id where ac.id = $1`, [id]);
	if (!rows[0]) throw new Error("Failed to record action.");
	return {
		action: mapAction(rows[0]),
		signal
	};
}
async function listActions(opts) {
	await boot();
	const sql = await getSql();
	const params = [];
	let where = "";
	if (opts?.actorAgentId) {
		params.push(opts.actorAgentId);
		where = `where ac.actor_agent_id = $${params.length}`;
	}
	params.push(opts?.limit ?? 50);
	return (await sql.query(`select ac.*, a.handle as actor_handle, a.display_name as actor_display_name
     from actions ac join agents a on a.id = ac.actor_agent_id
     ${where}
     order by ac.created_at desc
     limit $${params.length}`, params)).map(mapAction);
}
async function networkSnapshot() {
	await boot();
	const agents = await listAgents();
	const recentFollows = await listFollows();
	const recentActions = await listActions({ limit: 40 });
	const c = (await (await getSql()).query(`select
       (select count(*) from signals) as signals,
       (select count(*) from follows) as follows,
       (select count(*) from stories) as stories,
       (select count(*) from follows where x_follow_intent = true) as x_intents`))[0];
	return {
		agents,
		recentFollows: recentFollows.slice(0, 40),
		recentActions,
		signalCount: Number(c?.signals ?? 0),
		followCount: Number(c?.follows ?? 0),
		storyCount: Number(c?.stories ?? 0),
		xIntentCount: Number(c?.x_intents ?? 0),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		badge: "early-v1"
	};
}
async function refreshMeta() {
	await boot();
	const rows = await (await getSql()).query(`select key, value from network_meta where key in ('gbn_last_refresh','gbn_last_source')`);
	const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
	return {
		lastRefresh: map.gbn_last_refresh ?? null,
		source: map.gbn_last_source ?? null
	};
}
//#endregion
export { looksLikeApiKey as C, LIVE_NODE as S, refreshStories as _, getStoryBySlug as a, whoami as b, listAgents as c, listStories as d, networkSnapshot as f, refreshMeta as g, recordAction as h, getAgentByHandle as i, listFollows as l, postSignal as m, createAgent as n, getStoryDiscussion as o, overlappingAgents as p, followAgent as r, listActions as s, agentFromApiKey as t, listSignals as u, repo_server_exports as v, FEATURED_HANDLES as x, updateAgent as y };

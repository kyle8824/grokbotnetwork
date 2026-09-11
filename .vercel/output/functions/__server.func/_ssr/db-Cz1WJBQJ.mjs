//#region node_modules/.nitro/vite/services/ssr/assets/db-Cz1WJBQJ.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var _0002_schema_default = "-- Grok Bot Network / AgentWire V1\n-- Scale-shaped: text ids, junction tables, denormalized counters, action log.\n-- V1.1 hives tables are present but unused by runtime.\n\ncreate table if not exists network_meta (\n  key        text primary key,\n  value      text not null,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists agents (\n  id               text primary key,\n  handle           text not null unique,\n  display_name     text not null,\n  owner            text not null,\n  personality      text not null default '',\n  bio              text not null default '',\n  avatar_url       text,\n  signal_count     integer not null default 0,\n  follower_count   integer not null default 0,\n  following_count  integer not null default 0,\n  -- Reputation is a V1 stub. Do not invent live scores. V2 math is documented\n  -- in README: attributable corroboration, source quality, dissent quality,\n  -- recency decay. Follows and boosts do not inflate this number in V1.\n  reputation_score numeric not null default 0,\n  reputation_band  text not null default 'unranked',\n  is_publisher     boolean not null default false,\n  is_seed          boolean not null default false,\n  created_at       timestamptz not null default now()\n);\n\ncreate unique index if not exists agents_handle_lower_idx on agents (lower(handle));\ncreate index if not exists agents_created_idx on agents (created_at desc);\ncreate index if not exists agents_publisher_idx on agents (is_publisher);\n\ncreate table if not exists agent_interests (\n  agent_id  text not null references agents (id) on delete cascade,\n  interest  text not null,\n  primary key (agent_id, interest)\n);\n\ncreate index if not exists agent_interests_interest_idx on agent_interests (interest);\n\ncreate table if not exists agent_sources (\n  agent_id  text not null references agents (id) on delete cascade,\n  source    text not null,\n  primary key (agent_id, source)\n);\n\ncreate table if not exists follows (\n  from_agent_id text not null references agents (id) on delete cascade,\n  to_agent_id   text not null references agents (id) on delete cascade,\n  created_at    timestamptz not null default now(),\n  primary key (from_agent_id, to_agent_id),\n  check (from_agent_id <> to_agent_id)\n);\n\ncreate index if not exists follows_to_idx on follows (to_agent_id, created_at desc);\ncreate index if not exists follows_from_idx on follows (from_agent_id, created_at desc);\n\ncreate table if not exists stories (\n  id            text primary key,\n  slug          text not null unique,\n  title         text not null,\n  url           text not null,\n  source        text not null default 'grokbotnews',\n  topic         text not null default '',\n  summary       text not null default '',\n  kicker        text not null default '',\n  frames_json   text not null default '[]',\n  updated_at    timestamptz not null default now(),\n  ingested_at   timestamptz not null default now(),\n  is_fallback   boolean not null default false\n);\n\ncreate index if not exists stories_updated_idx on stories (updated_at desc);\ncreate index if not exists stories_topic_idx on stories (topic);\ncreate index if not exists stories_source_idx on stories (source);\n\ncreate table if not exists signals (\n  id                 text primary key,\n  author_agent_id    text not null references agents (id) on delete cascade,\n  created_at         timestamptz not null default now(),\n  headline           text not null,\n  topic              text not null default '',\n  summary            text not null,\n  confidence         numeric not null default 0.5,\n  source_count       integer not null default 0,\n  perspective_count  integer not null default 1,\n  story_url          text,\n  story_id           text references stories (id) on delete set null,\n  kind               text not null default 'signal',\n  is_demo            boolean not null default false,\n  check (kind in ('signal', 'analysis', 'source_check', 'dissent'))\n);\n\ncreate index if not exists signals_created_idx on signals (created_at desc);\ncreate index if not exists signals_author_idx on signals (author_agent_id, created_at desc);\ncreate index if not exists signals_story_idx on signals (story_id, created_at desc);\ncreate index if not exists signals_kind_idx on signals (kind);\ncreate index if not exists signals_topic_idx on signals (topic);\n\n-- Attributable partner actions. Discuss/Cite/Boost leave rows here.\ncreate table if not exists actions (\n  id              text primary key,\n  actor_agent_id  text not null references agents (id) on delete cascade,\n  kind            text not null,\n  target_type     text not null,\n  target_id       text not null,\n  note            text not null default '',\n  cite_url        text,\n  created_at      timestamptz not null default now(),\n  check (kind in ('discuss', 'cite', 'boost', 'follow'))\n);\n\ncreate index if not exists actions_created_idx on actions (created_at desc);\ncreate index if not exists actions_actor_idx on actions (actor_agent_id, created_at desc);\ncreate index if not exists actions_target_idx on actions (target_type, target_id, created_at desc);\n\n-- V1.1 Hives — schema only. No runtime in V1.\ncreate table if not exists hives (\n  id          text primary key,\n  name        text not null,\n  objective   text not null default '',\n  status      text not null default 'planned',\n  created_at  timestamptz not null default now(),\n  check (status in ('planned', 'draft', 'active', 'experiment', 'archived'))\n);\n\ncreate table if not exists hive_members (\n  hive_id   text not null references hives (id) on delete cascade,\n  agent_id  text not null references agents (id) on delete cascade,\n  role      text not null default 'analyst',\n  joined_at timestamptz not null default now(),\n  primary key (hive_id, agent_id),\n  check (role in ('researcher', 'analyst', 'strategist', 'devils_advocate', 'writer', 'lead'))\n);\n\ncreate table if not exists hive_messages (\n  id          text primary key,\n  hive_id     text not null references hives (id) on delete cascade,\n  agent_id    text not null references agents (id) on delete cascade,\n  content     text not null,\n  created_at  timestamptz not null default now()\n);\n\ncreate index if not exists hive_messages_hive_idx on hive_messages (hive_id, created_at);\n";
var _0003_api_keys_default = "-- AgentWire AUTH lock: per-agent secret API keys.\n-- Plaintext is returned once at signup. Only the hash is stored.\n\ncreate table if not exists agent_api_keys (\n  id           text primary key,\n  agent_id     text not null references agents (id) on delete cascade,\n  key_hash     text not null unique,\n  key_prefix   text not null,\n  created_at   timestamptz not null default now(),\n  last_used_at timestamptz,\n  revoked_at   timestamptz\n);\n\ncreate index if not exists agent_api_keys_agent_idx on agent_api_keys (agent_id);\n";
var _0004_social_default = "-- Optional X/Twitter link on an agent identity.\n-- Canonical store: https://x.com/{handle}\nalter table agents add column if not exists x_url text;\n\n-- Agent-decided \"also follow on X\" intent, recorded on an in-network follow edge.\n-- Default false. Never mass-set. Not an auto-follow.\nalter table follows add column if not exists x_follow_intent boolean not null default false;\nalter table follows add column if not exists x_follow_intent_at timestamptz;\n\ncreate index if not exists follows_x_intent_idx on follows (x_follow_intent);\n\n-- Attributable intent traces share the action log.\nalter table actions drop constraint if exists actions_kind_check;\nalter table actions add constraint actions_kind_check\n  check (kind in ('discuss', 'cite', 'boost', 'follow', 'x_follow_intent'));\n";
var _0005_signal_story_fk_default = "-- Repair: signals.story_id is optional. Null any orphan that would fail\n-- signals_story_id_fkey (seed used to insert SIGNALs before stories).\nupdate signals\n   set story_id = null\n where story_id is not null\n   and not exists (select 1 from stories st where st.id = signals.story_id);\n";
var _0006_story_fk_columns_default = "-- Idempotent column ensure for social + story FK safety.\n-- 0004 may have rolled back on a check-constraint rename; columns must still exist.\nalter table agents add column if not exists x_url text;\nalter table follows add column if not exists x_follow_intent boolean not null default false;\nalter table follows add column if not exists x_follow_intent_at timestamptz;\n\n-- story_id is already nullable (ON DELETE SET NULL). Null orphans so seed/ingest\n-- can never leave a row that violates signals_story_id_fkey.\nupdate signals\n   set story_id = null\n where story_id is not null\n   and not exists (select 1 from stories st where st.id = signals.story_id);\n";
var _0007_signal_story_nullable_default = "-- Production repair: signals.story_id is optional. Orphans 500 the node via\n-- signals_story_id_fkey. Force nullable and null any dangling ids.\nalter table signals alter column story_id drop not null;\n\nupdate signals\n   set story_id = null\n where story_id is not null\n   and not exists (select 1 from stories st where st.id = signals.story_id);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var db_exports = /* @__PURE__ */ __exportAll({
	dbSource: () => dbSource,
	ensureDbReady: () => ensureDbReady,
	getSql: () => getSql
});
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_schema.sql": _0002_schema_default,
			"/migrations/0003_api_keys.sql": _0003_api_keys_default,
			"/migrations/0004_social.sql": _0004_social_default,
			"/migrations/0005_signal_story_fk.sql": _0005_signal_story_fk_default,
			"/migrations/0006_story_fk_columns.sql": _0006_story_fk_columns_default,
			"/migrations/0007_signal_story_nullable.sql": _0007_signal_story_nullable_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
//#endregion
export { getSql as n, __exportAll as r, db_exports as t };

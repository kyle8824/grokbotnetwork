import { getSql, type Sql } from "@/lib/db";
import { fallbackStories } from "./gbn.server";
import {
  SEED_ACTIONS,
  SEED_AGENTS,
  SEED_FOLLOWS,
  SEED_REV,
  SEED_SIGNALS,
  SEED_X_INTENTS,
} from "./seed-data";

const globalRef = globalThis as typeof globalThis & {
  __agentwireSeedV5__?: Promise<void>;
};

export async function ensureSeeded(): Promise<void> {
  globalRef.__agentwireSeedV5__ ??= seedOnce().catch((err) => {
    console.error("[agentwire] seed failed", err);
    globalRef.__agentwireSeedV5__ = undefined;
    // Never throw: a seed FK must not 500 landing / feed / console.
  });
  await globalRef.__agentwireSeedV5__;
}

async function hasColumn(sql: Sql, table: string, column: string): Promise<boolean> {
  const rows = await sql.query<{ n: number }>(
    `select 1 as n from information_schema.columns
     where table_schema = 'public' and table_name = $1 and column_name = $2 limit 1`,
    [table, column],
  );
  return Boolean(rows[0]);
}

async function repairSignalStoryFk(sql: Sql): Promise<void> {
  try {
    await sql.query(`alter table signals alter column story_id drop not null`);
  } catch {
    /* already nullable or table missing during first migrate */
  }
  try {
    await sql.query(
      `update signals
          set story_id = null
        where story_id is not null
          and not exists (select 1 from stories st where st.id = signals.story_id)`,
    );
  } catch {
    /* ignore */
  }
}

async function ensureSocialColumns(sql: Sql): Promise<void> {
  try {
    await sql.query(`alter table agents add column if not exists x_url text`);
  } catch {
    /* ignore */
  }
  try {
    await sql.query(`alter table agents add column if not exists join_number integer`);
    await sql.query(`
      with ranked as (
        select id, row_number() over (order by created_at asc, id asc) as n
        from agents
        where join_number is null
      )
      update agents a set join_number = ranked.n from ranked where a.id = ranked.id
    `);
    await sql.query(
      `create unique index if not exists agents_join_number_uidx on agents (join_number)`,
    );
  } catch {
    /* ignore */
  }
  try {
    await sql.query(
      `alter table follows add column if not exists x_follow_intent boolean not null default false`,
    );
    await sql.query(`alter table follows add column if not exists x_follow_intent_at timestamptz`);
  } catch {
    /* ignore */
  }
}

async function upsertFallbackStories(sql: Sql): Promise<void> {
  for (const s of fallbackStories()) {
    try {
      await sql.query(
        `insert into stories (id, slug, title, url, source, topic, summary, kicker, frames_json, updated_at, is_fallback)
         values ($1,$2,$3,$4,'grokbotnews',$5,$6,$7,'[]',$8,true)
         on conflict (slug) do nothing`,
        [s.id, s.slug, s.title, s.url, s.topic, s.summary, s.kicker, s.updatedAt],
      );
    } catch {
      // id collision with a different slug — the row still exists; SIGNALs link by slug.
    }
  }
}

async function insertSeedSignal(
  sql: Sql,
  s: (typeof SEED_SIGNALS)[number],
): Promise<void> {
  const created = new Date(Date.now() - s.hoursAgo * 3600 * 1000).toISOString();
  const url = s.storySlug ? `https://www.grokbotnews.com/stories/${s.storySlug}` : null;
  // story_id is always NULL on insert so this statement cannot violate
  // signals_story_id_fkey. Link is a separate UPDATE that only writes an id
  // that already exists in stories.
  await sql.query(
    `insert into signals
      (id, author_agent_id, created_at, headline, topic, summary, confidence, source_count, perspective_count, story_url, story_id, kind, is_demo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,null,$11,true)
     on conflict (id) do nothing`,
    [
      s.id,
      s.authorAgentId,
      created,
      s.headline,
      s.topic,
      s.summary,
      s.confidence,
      s.sourceCount,
      s.perspectiveCount,
      url,
      s.kind,
    ],
  );
  if (!s.storySlug) return;
  await sql.query(
    `update signals
        set story_id = st.id
       from stories st
      where signals.id = $1
        and st.slug = $2`,
    [s.id, s.storySlug],
  );
}

async function seedOnce(): Promise<void> {
  const sql = await getSql();
  await ensureSocialColumns(sql);
  await repairSignalStoryFk(sql);

  const hasXUrl = await hasColumn(sql, "agents", "x_url");
  const hasXIntent = await hasColumn(sql, "follows", "x_follow_intent");

  for (const a of SEED_AGENTS) {
    if (hasXUrl) {
      await sql.query(
        `insert into agents (id, handle, display_name, owner, personality, bio, x_url, is_publisher, is_seed, reputation_score, reputation_band)
         values ($1,$2,$3,$4,$5,$6,$7,$8,true,0,'unranked')
         on conflict (id) do update set
           handle = excluded.handle,
           display_name = excluded.display_name,
           owner = excluded.owner,
           personality = excluded.personality,
           bio = excluded.bio,
           x_url = excluded.x_url,
           is_publisher = excluded.is_publisher,
           is_seed = true`,
        [
          a.id,
          a.handle,
          a.displayName,
          a.owner,
          a.personality,
          a.bio,
          a.xUrl ?? null,
          Boolean(a.isPublisher),
        ],
      );
    } else {
      await sql.query(
        `insert into agents (id, handle, display_name, owner, personality, bio, is_publisher, is_seed, reputation_score, reputation_band)
         values ($1,$2,$3,$4,$5,$6,$7,true,0,'unranked')
         on conflict (id) do update set
           handle = excluded.handle,
           display_name = excluded.display_name,
           owner = excluded.owner,
           personality = excluded.personality,
           bio = excluded.bio,
           is_publisher = excluded.is_publisher,
           is_seed = true`,
        [
          a.id,
          a.handle,
          a.displayName,
          a.owner,
          a.personality,
          a.bio,
          Boolean(a.isPublisher),
        ],
      );
    }
    await sql.query(`delete from agent_interests where agent_id = $1`, [a.id]);
    await sql.query(`delete from agent_sources where agent_id = $1`, [a.id]);
    for (const interest of a.interests) {
      await sql.query(
        `insert into agent_interests (agent_id, interest) values ($1,$2) on conflict do nothing`,
        [a.id, interest],
      );
    }
    for (const source of a.sources) {
      await sql.query(
        `insert into agent_sources (agent_id, source) values ($1,$2) on conflict do nothing`,
        [a.id, source],
      );
    }
  }

  await upsertFallbackStories(sql);
  await repairSignalStoryFk(sql);

  const rev = await sql.query<{ value: string }>(`select value from network_meta where key = 'seed_rev'`);
  const already = rev[0]?.value === SEED_REV;

  if (!already) {
    await sql.query(
      `delete from follows f
       where exists (select 1 from agents a where a.id = f.from_agent_id and a.is_seed)
         and exists (select 1 from agents b where b.id = f.to_agent_id and b.is_seed)`,
    );
    for (const [from, to] of SEED_FOLLOWS) {
      await sql.query(
        `insert into follows (from_agent_id, to_agent_id) values ($1,$2) on conflict do nothing`,
        [from, to],
      );
    }

    await sql.query(`delete from signals where is_demo = true`);
    for (const s of SEED_SIGNALS) {
      try {
        await insertSeedSignal(sql, s);
      } catch (err) {
        console.error("[agentwire] seed signal skipped", s.id, err);
        try {
          await sql.query(`update signals set story_id = null where id = $1`, [s.id]);
        } catch {
          /* ignore */
        }
      }
    }
    await repairSignalStoryFk(sql);

    for (const a of SEED_ACTIONS) {
      await sql.query(`delete from actions where id = $1`, [a.id]);
    }
    for (const a of SEED_ACTIONS) {
      const created = new Date(Date.now() - a.hoursAgo * 3600 * 1000).toISOString();
      try {
        await sql.query(
          `insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url, created_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8)
           on conflict (id) do nothing`,
          [a.id, a.actorAgentId, a.kind, a.targetType, a.targetId, a.note, a.citeUrl ?? null, created],
        );
      } catch (err) {
        console.error("[agentwire] seed action skipped", a.id, err);
      }
    }

    await sql.query(
      `insert into network_meta (key, value) values ('seed_rev', $1)
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [SEED_REV],
    );
  }

  if (hasXIntent) {
    for (const [from, to] of SEED_X_INTENTS) {
      await sql.query(
        `update follows
         set x_follow_intent = true, x_follow_intent_at = coalesce(x_follow_intent_at, now())
         where from_agent_id = $1 and to_agent_id = $2`,
        [from, to],
      );
      const target = SEED_AGENTS.find((agent) => agent.id === to);
      try {
        await sql.query(
          `insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
           values ($1,$2,'x_follow_intent','agent',$3,$4,$5)
           on conflict (id) do nothing`,
          [
            `ac_x_${from}_${to}`,
            from,
            to,
            `Declared X follow intent toward @${target?.handle ?? to}`,
            target?.xUrl ?? null,
          ],
        );
      } catch {
        await sql.query(
          `insert into actions (id, actor_agent_id, kind, target_type, target_id, note, cite_url)
           values ($1,$2,'follow','agent',$3,$4,$5)
           on conflict (id) do nothing`,
          [
            `ac_x_${from}_${to}`,
            from,
            to,
            `Declared X follow intent toward @${target?.handle ?? to}`,
            target?.xUrl ?? null,
          ],
        );
      }
    }
  }

  await sql.query(`
    update agents a set
      signal_count = (select count(*) from signals s where s.author_agent_id = a.id),
      follower_count = (select count(*) from follows f where f.to_agent_id = a.id),
      following_count = (select count(*) from follows f where f.from_agent_id = a.id)
  `);

  const refresh = await sql.query<{ value: string }>(
    `select value from network_meta where key = 'gbn_last_refresh'`,
  );
  if (!refresh[0]) {
    await sql.query(
      `insert into network_meta (key, value) values ('gbn_last_refresh', $1), ('gbn_last_source', 'seed')
       on conflict (key) do nothing`,
      [new Date().toISOString()],
    );
  }
}

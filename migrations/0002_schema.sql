-- Grok Bot Network / AgentWire V1
-- Scale-shaped: text ids, junction tables, denormalized counters, action log.
-- V1.1 hives tables are present but unused by runtime.

create table if not exists network_meta (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create table if not exists agents (
  id               text primary key,
  handle           text not null unique,
  display_name     text not null,
  owner            text not null,
  personality      text not null default '',
  bio              text not null default '',
  avatar_url       text,
  signal_count     integer not null default 0,
  follower_count   integer not null default 0,
  following_count  integer not null default 0,
  -- Reputation is a V1 stub. Do not invent live scores. V2 math is documented
  -- in README: attributable corroboration, source quality, dissent quality,
  -- recency decay. Follows and boosts do not inflate this number in V1.
  reputation_score numeric not null default 0,
  reputation_band  text not null default 'unranked',
  is_publisher     boolean not null default false,
  is_seed          boolean not null default false,
  created_at       timestamptz not null default now()
);

create unique index if not exists agents_handle_lower_idx on agents (lower(handle));
create index if not exists agents_created_idx on agents (created_at desc);
create index if not exists agents_publisher_idx on agents (is_publisher);

create table if not exists agent_interests (
  agent_id  text not null references agents (id) on delete cascade,
  interest  text not null,
  primary key (agent_id, interest)
);

create index if not exists agent_interests_interest_idx on agent_interests (interest);

create table if not exists agent_sources (
  agent_id  text not null references agents (id) on delete cascade,
  source    text not null,
  primary key (agent_id, source)
);

create table if not exists follows (
  from_agent_id text not null references agents (id) on delete cascade,
  to_agent_id   text not null references agents (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (from_agent_id, to_agent_id),
  check (from_agent_id <> to_agent_id)
);

create index if not exists follows_to_idx on follows (to_agent_id, created_at desc);
create index if not exists follows_from_idx on follows (from_agent_id, created_at desc);

create table if not exists stories (
  id            text primary key,
  slug          text not null unique,
  title         text not null,
  url           text not null,
  source        text not null default 'grokbotnews',
  topic         text not null default '',
  summary       text not null default '',
  kicker        text not null default '',
  frames_json   text not null default '[]',
  updated_at    timestamptz not null default now(),
  ingested_at   timestamptz not null default now(),
  is_fallback   boolean not null default false
);

create index if not exists stories_updated_idx on stories (updated_at desc);
create index if not exists stories_topic_idx on stories (topic);
create index if not exists stories_source_idx on stories (source);

create table if not exists signals (
  id                 text primary key,
  author_agent_id    text not null references agents (id) on delete cascade,
  created_at         timestamptz not null default now(),
  headline           text not null,
  topic              text not null default '',
  summary            text not null,
  confidence         numeric not null default 0.5,
  source_count       integer not null default 0,
  perspective_count  integer not null default 1,
  story_url          text,
  story_id           text references stories (id) on delete set null,
  kind               text not null default 'signal',
  is_demo            boolean not null default false,
  check (kind in ('signal', 'analysis', 'source_check', 'dissent'))
);

create index if not exists signals_created_idx on signals (created_at desc);
create index if not exists signals_author_idx on signals (author_agent_id, created_at desc);
create index if not exists signals_story_idx on signals (story_id, created_at desc);
create index if not exists signals_kind_idx on signals (kind);
create index if not exists signals_topic_idx on signals (topic);

-- Attributable partner actions. Discuss/Cite/Boost leave rows here.
create table if not exists actions (
  id              text primary key,
  actor_agent_id  text not null references agents (id) on delete cascade,
  kind            text not null,
  target_type     text not null,
  target_id       text not null,
  note            text not null default '',
  cite_url        text,
  created_at      timestamptz not null default now(),
  check (kind in ('discuss', 'cite', 'boost', 'follow'))
);

create index if not exists actions_created_idx on actions (created_at desc);
create index if not exists actions_actor_idx on actions (actor_agent_id, created_at desc);
create index if not exists actions_target_idx on actions (target_type, target_id, created_at desc);

-- V1.1 Hives — schema only. No runtime in V1.
create table if not exists hives (
  id          text primary key,
  name        text not null,
  objective   text not null default '',
  status      text not null default 'planned',
  created_at  timestamptz not null default now(),
  check (status in ('planned', 'draft', 'active', 'experiment', 'archived'))
);

create table if not exists hive_members (
  hive_id   text not null references hives (id) on delete cascade,
  agent_id  text not null references agents (id) on delete cascade,
  role      text not null default 'analyst',
  joined_at timestamptz not null default now(),
  primary key (hive_id, agent_id),
  check (role in ('researcher', 'analyst', 'strategist', 'devils_advocate', 'writer', 'lead'))
);

create table if not exists hive_messages (
  id          text primary key,
  hive_id     text not null references hives (id) on delete cascade,
  agent_id    text not null references agents (id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists hive_messages_hive_idx on hive_messages (hive_id, created_at);

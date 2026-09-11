-- Optional X/Twitter link on an agent identity.
-- Canonical store: https://x.com/{handle}
alter table agents add column if not exists x_url text;

-- Agent-decided "also follow on X" intent, recorded on an in-network follow edge.
-- Default false. Never mass-set. Not an auto-follow.
alter table follows add column if not exists x_follow_intent boolean not null default false;
alter table follows add column if not exists x_follow_intent_at timestamptz;

create index if not exists follows_x_intent_idx on follows (x_follow_intent);

-- Attributable intent traces share the action log.
alter table actions drop constraint if exists actions_kind_check;
alter table actions add constraint actions_kind_check
  check (kind in ('discuss', 'cite', 'boost', 'follow', 'x_follow_intent'));

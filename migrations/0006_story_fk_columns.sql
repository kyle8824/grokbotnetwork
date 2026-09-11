-- Idempotent column ensure for social + story FK safety.
-- 0004 may have rolled back on a check-constraint rename; columns must still exist.
alter table agents add column if not exists x_url text;
alter table follows add column if not exists x_follow_intent boolean not null default false;
alter table follows add column if not exists x_follow_intent_at timestamptz;

-- story_id is already nullable (ON DELETE SET NULL). Null orphans so seed/ingest
-- can never leave a row that violates signals_story_id_fkey.
update signals
   set story_id = null
 where story_id is not null
   and not exists (select 1 from stories st where st.id = signals.story_id);

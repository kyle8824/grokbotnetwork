-- Production repair: signals.story_id is optional. Orphans 500 the node via
-- signals_story_id_fkey. Force nullable and null any dangling ids.
alter table signals alter column story_id drop not null;

update signals
   set story_id = null
 where story_id is not null
   and not exists (select 1 from stories st where st.id = signals.story_id);

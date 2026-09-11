-- Repair: signals.story_id is optional. Null any orphan that would fail
-- signals_story_id_fkey (seed used to insert SIGNALs before stories).
update signals
   set story_id = null
 where story_id is not null
   and not exists (select 1 from stories st where st.id = signals.story_id);

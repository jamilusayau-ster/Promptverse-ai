-- ============================================================
-- PHASE 2 MIGRATION — run this in Supabase SQL Editor
-- (Your Phase 1 schema.sql already ran — this only ADDS to it.)
-- ============================================================

-- Public/anon users cannot UPDATE the `prompts` table directly (RLS only
-- allows admin writes). This function lets anyone increment JUST the
-- view_count column for a single published prompt, safely, without
-- exposing update access to anything else on the row.
create or replace function increment_prompt_view(p_prompt_id uuid)
returns void as $$
begin
  update prompts
  set view_count = view_count + 1
  where id = p_prompt_id and status = 'published';
end;
$$ language plpgsql security definer;

grant execute on function increment_prompt_view(uuid) to anon, authenticated;

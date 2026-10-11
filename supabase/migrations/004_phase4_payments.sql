-- PHASE 4 MIGRATION: prevents duplicate unlocks / replayed payments.
-- Run in Supabase SQL Editor (new query, paste, check last line, Run).

create unique index if not exists uniq_unlock_payment_reference
  on unlocks(payment_reference) where payment_reference is not null;

create unique index if not exists uniq_unlock_guest_email_prompt
  on unlocks(lower(email), prompt_id) where user_id is null and email is not null;

-- Price per prompt lives in the database (NULL = use the default of 1000 NGN).
alter table prompts add column if not exists price_ngn integer;

-- Re-create the public view with the price column added at the end.
-- Premium master_prompt / negative_prompt are still hidden here.
create or replace view prompts_public as
select
  id, title, slug, description, thumbnail_url, category_id, platform,
  prompt_type, featured, status, view_count, created_at, updated_at,
  how_to_use, pro_tips, settings,
  case when prompt_type = 'free' then master_prompt else null end as master_prompt,
  case when prompt_type = 'free' then negative_prompt else null end as negative_prompt,
  price_ngn
from prompts
where status = 'published';

grant select on prompts_public to anon, authenticated;

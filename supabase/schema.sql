-- ============================================================
-- PROMPTVERSE AI — Database Schema
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    case when new.email = 'jamilusayau@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROMPTS
-- ============================================================
create table if not exists prompts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  category_id uuid references categories(id) on delete set null,
  platform text,
  prompt_type text not null default 'free' check (prompt_type in ('free','premium')),
  master_prompt text not null,
  negative_prompt text,
  settings jsonb,
  how_to_use text,
  pro_tips text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompts_status on prompts(status);
create index if not exists idx_prompts_category on prompts(category_id);
create index if not exists idx_prompts_type on prompts(prompt_type);
create index if not exists idx_prompts_featured on prompts(featured);
create index if not exists idx_prompts_search on prompts using gin (to_tsvector('english', title || ' ' || coalesce(description,'')));

-- ============================================================
-- TAGS
-- ============================================================
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null
);

create table if not exists prompt_tags (
  prompt_id uuid references prompts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

-- ============================================================
-- UNLOCKS
-- ============================================================
create table if not exists unlocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  prompt_id uuid not null references prompts(id) on delete cascade,
  unlock_method text not null check (unlock_method in ('payment','rewarded_ads','admin')),
  payment_reference text,
  ad_unlock_session uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_unlocks_user on unlocks(user_id);
create index if not exists idx_unlocks_email on unlocks(email);
create unique index if not exists uniq_unlock_user_prompt on unlocks(user_id, prompt_id) where user_id is not null;

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  prompt_id uuid not null references prompts(id) on delete cascade,
  reference text unique not null,
  amount integer not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','success','failed')),
  gateway text not null default 'paystack',
  metadata jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists idx_payments_reference on payments(reference);

-- ============================================================
-- AD UNLOCK SESSIONS
-- ============================================================
create table if not exists ad_unlock_sessions (
  id uuid primary key default uuid_generate_v4(),
  session_token uuid not null default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  ads_required integer not null default 3,
  ads_completed integer not null default 0,
  status text not null default 'pending' check (status in ('pending','completed','expired','cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);

-- ============================================================
-- FAVORITES
-- ============================================================
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, prompt_id)
);

-- ============================================================
-- PAGE VIEWS
-- ============================================================
create table if not exists page_views (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid references prompts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table prompts enable row level security;
alter table tags enable row level security;
alter table prompt_tags enable row level security;
alter table unlocks enable row level security;
alter table payments enable row level security;
alter table ad_unlock_sessions enable row level security;
alter table favorites enable row level security;
alter table page_views enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: users read/update own row; admins read all
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = user_id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = user_id);

-- CATEGORIES: public read; admin write
create policy "categories_public_read" on categories
  for select using (true);
create policy "categories_admin_write" on categories
  for insert with check (is_admin());
create policy "categories_admin_update" on categories
  for update using (is_admin());
create policy "categories_admin_delete" on categories
  for delete using (is_admin());

-- PROMPTS: public can read published rows, but master_prompt / negative_prompt
-- for premium items must NEVER be selected directly by anon/public clients.
-- Enforce this at the application layer: public queries must explicitly
-- select only safe columns (id,title,slug,description,thumbnail_url,category_id,
-- platform,prompt_type,featured,view_count,created_at) and never master_prompt
-- for prompt_type = 'premium'. RLS below only gates row visibility, not columns.
create policy "prompts_public_read_published" on prompts
  for select using (status = 'published' or is_admin());
create policy "prompts_admin_write" on prompts
  for insert with check (is_admin());
create policy "prompts_admin_update" on prompts
  for update using (is_admin());
create policy "prompts_admin_delete" on prompts
  for delete using (is_admin());

-- TAGS / PROMPT_TAGS: public read, admin write
create policy "tags_public_read" on tags for select using (true);
create policy "tags_admin_write" on tags for insert with check (is_admin());
create policy "tags_admin_update" on tags for update using (is_admin());
create policy "tags_admin_delete" on tags for delete using (is_admin());
create policy "prompt_tags_public_read" on prompt_tags for select using (true);
create policy "prompt_tags_admin_write" on prompt_tags for insert with check (is_admin());
create policy "prompt_tags_admin_delete" on prompt_tags for delete using (is_admin());

-- UNLOCKS: users see only their own; admin sees all.
-- Rows are created only via server routes using the service role key.
create policy "unlocks_select_own_or_admin" on unlocks
  for select using (auth.uid() = user_id or is_admin());

-- PAYMENTS: users see only their own; admin sees all. Inserts/updates
-- happen only via server routes with the service role key.
create policy "payments_select_own_or_admin" on payments
  for select using (auth.uid() = user_id or is_admin());

-- AD UNLOCK SESSIONS: users see only their own; admin sees all.
create policy "ad_sessions_select_own_or_admin" on ad_unlock_sessions
  for select using (auth.uid() = user_id or is_admin());

-- FAVORITES: fully owned by the user
create policy "favorites_select_own" on favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on favorites for delete using (auth.uid() = user_id);

-- PAGE VIEWS: insert-only from clients, read by admin only
create policy "page_views_insert_any" on page_views for insert with check (true);
create policy "page_views_select_admin" on page_views for select using (is_admin());

-- ============================================================
-- STORAGE BUCKET (run in Storage UI or via SQL if supported)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true)
on conflict (id) do nothing;

create policy "prompt_images_public_read" on storage.objects
  for select using (bucket_id = 'prompt-images');
create policy "prompt_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'prompt-images' and is_admin());
create policy "prompt_images_admin_update" on storage.objects
  for update using (bucket_id = 'prompt-images' and is_admin());
create policy "prompt_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'prompt-images' and is_admin());

-- ============================================================
-- PUBLIC-SAFE VIEW
-- Column-level protection: this view never exposes master_prompt /
-- negative_prompt for premium rows. The public browse/search/detail-preview
-- pages must query THIS view, never the `prompts` table directly.
-- The full master_prompt is only ever returned by the server-side
-- /api/prompts/[id]/unlocked route, after a verified unlock.
-- ============================================================
create or replace view prompts_public as
select
  id, title, slug, description, thumbnail_url, category_id, platform,
  prompt_type, featured, status, view_count, created_at, updated_at,
  how_to_use, pro_tips, settings,
  case when prompt_type = 'free' then master_prompt else null end as master_prompt,
  case when prompt_type = 'free' then negative_prompt else null end as negative_prompt
from prompts
where status = 'published';

grant select on prompts_public to anon, authenticated;

-- ============================================================
-- SEED: starter categories
-- ============================================================
insert into categories (name, slug, icon) values
  ('Google Veo', 'google-veo', '🎬'),
  ('Kling AI', 'kling-ai', '🎞️'),
  ('Runway', 'runway', '🛫'),
  ('Seedance', 'seedance', '💃'),
  ('Image Prompts', 'image-prompts', '🖼️'),
  ('ChatGPT Prompts', 'chatgpt-prompts', '💬'),
  ('Storytelling', 'storytelling', '📖'),
  ('Viral Reels', 'viral-reels', '🔥'),
  ('YouTube', 'youtube', '▶️'),
  ('TikTok', 'tiktok', '🎵'),
  ('Facebook', 'facebook', '📘'),
  ('Marketing', 'marketing', '📈'),
  ('Product Photography', 'product-photography', '📸'),
  ('Cinematic Prompts', 'cinematic-prompts', '🎥')
on conflict (slug) do nothing;

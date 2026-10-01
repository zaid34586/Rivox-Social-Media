-- Core tables for AI Social Marketing SaaS

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website_url text,
  product_desc text,
  audience text,
  tone text default 'professional',
  niche text,
  goals text default 'sales',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade,
  platform text not null check (platform in ('instagram','x','linkedin')),
  format text default 'post',
  content text not null,
  hashtags text[] default '{}',
  image_url text,
  status text not null default 'draft' check (status in ('draft','scheduled','published','failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  metrics jsonb not null default '{"likes":0,"comments":0,"shares":0,"clicks":0,"sales":0}',
  created_at timestamptz not null default now()
);

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','x','linkedin')),
  account_name text,
  status text not null default 'not_connected' check (status in ('not_connected','connected','needs_api_keys')),
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

create table if not exists public.seo_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade,
  title text not null,
  keyword text not null,
  meta_description text default '',
  content text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tracked_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade,
  keyword text not null,
  position int,
  monthly_volume int,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  event_type text not null,
  platform text,
  value int not null default 1,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade,
  task_type text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS on all tables
alter table public.brands enable row level security;
alter table public.posts enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.seo_articles enable row level security;
alter table public.tracked_keywords enable row level security;
alter table public.analytics_events enable row level security;
alter table public.ai_tasks enable row level security;

create policy "brands_owner" on public.brands for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts_owner" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts_owner" on public.connected_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "articles_owner" on public.seo_articles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "keywords_owner" on public.tracked_keywords for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events_owner" on public.analytics_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_owner" on public.ai_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

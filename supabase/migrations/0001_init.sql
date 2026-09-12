-- validate: initial schema
-- profiles / projects / generations / page_views / responses with RLS

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: owner read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles: owner update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  idea jsonb not null,
  brief jsonb,
  document jsonb not null,
  version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_idx on public.projects (owner_id, created_at desc);
alter table public.projects enable row level security;

create policy "projects: owner all" on public.projects
  for all to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Anyone can read a published page (rendered server-side with the publishable key).
create policy "projects: public read published" on public.projects
  for select to anon, authenticated
  using (status = 'published');

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

-- ---------- generations (cost/usage log) ----------
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('brief', 'document', 'section')),
  generator text not null,
  input_tokens integer,
  output_tokens integer,
  ms integer,
  created_at timestamptz not null default now()
);
create index generations_owner_idx on public.generations (owner_id, created_at desc);
alter table public.generations enable row level security;
create policy "generations: owner read" on public.generations for select to authenticated using (auth.uid() = owner_id);
create policy "generations: owner insert" on public.generations for insert to authenticated with check (auth.uid() = owner_id);

-- ---------- page_views ----------
create table public.page_views (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  visitor_id text not null,
  referrer text,
  utm jsonb,
  created_at timestamptz not null default now()
);
create index page_views_project_idx on public.page_views (project_id, created_at desc);
alter table public.page_views enable row level security;
-- No anon policies: writes go through the service role in /api/view. Owners can read.
create policy "page_views: owner read" on public.page_views for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- ---------- responses ----------
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  visitor_id text not null,
  kind text not null check (kind in ('would_pay', 'would_not_pay')),
  tier_id text,
  amount_cents integer,
  currency text,
  interval text,
  email text,
  reason text,
  referrer text,
  utm jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, visitor_id)
);
create index responses_project_idx on public.responses (project_id, created_at desc);
alter table public.responses enable row level security;
create policy "responses: owner read" on public.responses for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create trigger responses_set_updated_at before update on public.responses
for each row execute function public.set_updated_at();

-- ---------- aggregate stats exposed to the public page (no row-level data) ----------
create or replace function public.project_public_stats(p_slug text)
returns table (responses bigint, would_pay bigint)
language sql
security definer
set search_path = ''
stable
as $$
  select count(*)::bigint as responses,
         count(*) filter (where r.kind = 'would_pay')::bigint as would_pay
  from public.responses r
  join public.projects p on p.id = r.project_id
  where p.slug = p_slug and p.status = 'published';
$$;
grant execute on function public.project_public_stats(text) to anon, authenticated;

-- Pay-on-yes: a page's full result (leads, reasons, defensible price) is unlocked once,
-- priced at one month of the defensible price the market picked (free when the market said no).

alter table public.projects add column unlocked_at timestamptz;

-- Only trusted server code (service role) may set or clear unlocked_at; owners can't self-unlock.
create or replace function public.guard_unlocked_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.unlocked_at is not null and auth.role() is distinct from 'service_role' then
      new.unlocked_at := null;
    end if;
  elsif new.unlocked_at is distinct from old.unlocked_at and auth.role() is distinct from 'service_role' then
    raise exception 'unlocked_at is managed by the server' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke execute on function public.guard_unlocked_at() from public, anon, authenticated;
create trigger projects_guard_unlocked_at before insert or update on public.projects
for each row execute function public.guard_unlocked_at();

-- One row per unlock, so the founder's receipts and our revenue are queryable.
create table public.unlocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'USD',
  -- 'free' when the market said no; 'dev' for local testing; otherwise the payment provider
  provider text not null,
  provider_ref text,
  created_at timestamptz not null default now()
);
create index unlocks_owner_idx on public.unlocks (owner_id, created_at desc);
alter table public.unlocks enable row level security;
create policy "unlocks: owner read" on public.unlocks for select to authenticated using (auth.uid() = owner_id);

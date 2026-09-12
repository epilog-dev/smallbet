-- Slugs are globally unique, but owners can no longer see other owners' rows (0006), so the
-- uniqueness check needs a definer function that sees every project without exposing any of it.
create or replace function public.slug_taken(p_slug text, p_exclude uuid default null)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.projects p
    where p.slug = p_slug and (p_exclude is null or p.id <> p_exclude)
  );
$$;
revoke all on function public.slug_taken(text, uuid) from public;
grant execute on function public.slug_taken(text, uuid) to authenticated;

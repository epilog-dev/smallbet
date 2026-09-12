-- Price ladder: the public page needs per-option counts for the post-answer reveal,
-- and the email is now asked *after* the answer, so it must be settable afterwards.

-- Aggregate counts per chosen option (tier_id null = wouldn't pay). No row-level data.
create or replace function public.project_public_buckets(p_slug text)
returns table (tier_id text, n bigint)
language sql
security definer
set search_path = ''
stable
as $$
  select r.tier_id, count(*)::bigint as n
  from public.responses r
  join public.projects p on p.id = r.project_id
  where p.slug = p_slug and p.status = 'published'
  group by r.tier_id;
$$;
revoke all on function public.project_public_buckets(text) from public;
grant execute on function public.project_public_buckets(text) to anon, authenticated;

-- Visitor updates their own response: reason and/or email. Either may be omitted.
create or replace function public.set_response_details(p_id uuid, p_visitor text, p_reason text default null, p_email text default null)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.responses
  set reason = coalesce(left(p_reason, 1000), reason),
      email = coalesce(nullif(left(lower(trim(p_email)), 254), ''), email),
      updated_at = now()
  where id = p_id and visitor_id = p_visitor;
$$;
revoke all on function public.set_response_details(uuid, text, text, text) from public;
grant execute on function public.set_response_details(uuid, text, text, text) to anon, authenticated;

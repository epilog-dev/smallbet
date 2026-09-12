-- Public write paths for visitors, as SECURITY DEFINER functions so no service-role key
-- is needed in the app. Each validates that the target page is published and never
-- returns row-level data of other visitors.

create or replace function public.record_view(p_slug text, p_visitor text, p_referrer text default null, p_utm jsonb default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project uuid;
begin
  if p_visitor is null or length(p_visitor) < 8 or length(p_visitor) > 64 then
    return;
  end if;
  select id into v_project from public.projects where slug = p_slug and status = 'published';
  if v_project is null then
    return;
  end if;
  -- one view per visitor per 24h
  if exists (
    select 1 from public.page_views
    where project_id = v_project and visitor_id = p_visitor and created_at > now() - interval '24 hours'
  ) then
    return;
  end if;
  insert into public.page_views (project_id, visitor_id, referrer, utm)
  values (v_project, p_visitor, left(p_referrer, 500), p_utm);
end;
$$;

create or replace function public.submit_response(
  p_slug text,
  p_visitor text,
  p_kind text,
  p_tier_id text default null,
  p_amount_cents integer default null,
  p_currency text default null,
  p_interval text default null,
  p_email text default null,
  p_referrer text default null,
  p_utm jsonb default null
)
returns table (id uuid, responses bigint, would_pay bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project uuid;
  v_id uuid;
begin
  if p_visitor is null or length(p_visitor) < 8 or length(p_visitor) > 64 then
    raise exception 'invalid visitor' using errcode = '22023';
  end if;
  if p_kind not in ('would_pay', 'would_not_pay') then
    raise exception 'invalid kind' using errcode = '22023';
  end if;
  select p.id into v_project from public.projects p where p.slug = p_slug and p.status = 'published';
  if v_project is null then
    raise exception 'page not found' using errcode = 'P0002';
  end if;

  insert into public.responses (project_id, visitor_id, kind, tier_id, amount_cents, currency, interval, email, referrer, utm)
  values (
    v_project, p_visitor, p_kind,
    case when p_kind = 'would_pay' then left(p_tier_id, 40) end,
    case when p_kind = 'would_pay' then p_amount_cents end,
    left(p_currency, 3), left(p_interval, 12), nullif(left(lower(trim(p_email)), 254), ''), left(p_referrer, 500), p_utm
  )
  on conflict (project_id, visitor_id) do update set
    kind = excluded.kind,
    tier_id = excluded.tier_id,
    amount_cents = excluded.amount_cents,
    currency = excluded.currency,
    interval = excluded.interval,
    email = coalesce(excluded.email, public.responses.email),
    updated_at = now()
  returning public.responses.id into v_id;

  return query
    select v_id,
           count(*)::bigint,
           count(*) filter (where r.kind = 'would_pay')::bigint
    from public.responses r where r.project_id = v_project;
end;
$$;

create or replace function public.set_response_reason(p_id uuid, p_visitor text, p_reason text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.responses
  set reason = left(p_reason, 1000), updated_at = now()
  where id = p_id and visitor_id = p_visitor;
$$;

revoke all on function public.record_view(text, text, text, jsonb) from public;
revoke all on function public.submit_response(text, text, text, text, integer, text, text, text, text, jsonb) from public;
revoke all on function public.set_response_reason(uuid, text, text) from public;
grant execute on function public.record_view(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.submit_response(text, text, text, text, integer, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.set_response_reason(uuid, text, text) to anon, authenticated;

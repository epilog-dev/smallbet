-- Projects are private to their owner. The old "public read published" policy let any signed-in
-- user select every published project (name, idea, brief, document) — the dashboard, which never
-- filtered by owner, showed other people's pages. Public pages now read through a view that
-- exposes only the columns a rendered page needs.

drop policy if exists "projects: public read published" on public.projects;

create or replace view public.published_pages
with (security_invoker = false) as
  select id, slug, name, document, published_at, created_at
  from public.projects
  where status = 'published';

revoke all on public.published_pages from public;
grant select on public.published_pages to anon, authenticated;

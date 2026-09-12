import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/db/projects";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your ideas" };

export default async function ProjectsPage() {
  const db = await createClient();
  const [projects, archived] = await Promise.all([listProjects(db), listProjects(db, { archived: true })]);

  if (projects.length === 0 && archived.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Nothing here yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Describe an idea and we&apos;ll build a page that asks people what they&apos;d pay for it.</p>
        <Button size="lg" className="mt-6" render={<Link href="/app/new" />} nativeButton={false}>
          <Plus /> Describe your idea
        </Button>
      </div>
    );
  }

  return (
    <div>
      {projects.length === 0 && (
        <div className="mb-10 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Everything is archived.{" "}
          <Link href="/app/new" className="font-medium text-foreground underline-offset-4 hover:underline">
            Describe a new idea
          </Link>{" "}
          or restore one below.
        </div>
      )}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your ideas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "page" : "pages"}
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const hero = p.document.sections.find((s) => s.type === "hero");
          const pct = p.responses ? Math.round((p.would_pay / p.responses) * 100) : null;
          return (
            <li key={p.id}>
              <Link href={`/app/projects/${p.id}`} className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold tracking-tight">{p.name}</h2>
                  <Badge variant={p.status === "published" ? "default" : "secondary"} className="capitalize">
                    {p.status}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{hero?.type === "hero" ? hero.props.headline : p.document.meta.tagline}</p>
                <dl className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Views</dt>
                    <dd className="font-medium tabular-nums">{p.views}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Answers</dt>
                    <dd className="font-medium tabular-nums">{p.responses}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Would pay</dt>
                    <dd className="font-medium tabular-nums">{pct === null ? "—" : `${pct}%`}</dd>
                  </div>
                </dl>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                  Open <ArrowRight className="size-3" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {archived.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Archived · {archived.length}
          </summary>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {archived.map((p) => (
              <li key={p.id}>
                <Link href={`/app/projects/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {p.responses} {p.responses === 1 ? "answer" : "answers"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

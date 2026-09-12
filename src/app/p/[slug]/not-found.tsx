import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">This page isn&apos;t live</h1>
      <p className="max-w-sm text-sm text-muted-foreground">It may have been unpublished, or the link is wrong. If it&apos;s yours, publish it from your dashboard.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        validate
      </Link>
    </main>
  );
}

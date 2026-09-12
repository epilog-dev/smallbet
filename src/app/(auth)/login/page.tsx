import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/app/auth/LoginForm";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { SmallbetLogo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";
  const error = typeof sp.error === "string" ? sp.error : undefined;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-12 items-center justify-between px-6">
        <Link href="/" className="flex items-center text-sm">
          <SmallbetLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your pages and responses live behind this account.</p>
          <div className="mt-6">
            <LoginForm next={next} initialError={error === "auth" ? "That link has expired or was already used. Request a new one." : undefined} />
          </div>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmallbetLogo } from "@/components/brand/Logo";
import { ThemeToggle } from "../ThemeToggle";
import { UserMenu } from "./UserMenu";

export function AppShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/app" className="flex items-center text-sm">
            <SmallbetLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" render={<Link href="/app/new" />} nativeButton={false}>
              <Plus /> New idea
            </Button>
            <ThemeToggle />
            <UserMenu email={email} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

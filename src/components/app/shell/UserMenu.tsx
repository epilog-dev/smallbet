"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Loader2, LogOut, Plus } from "lucide-react";
import { signOutAction } from "@/app/(app)/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-accent"
      >
        {email.slice(0, 1).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Base UI requires GroupLabel to live inside a Group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate font-normal">
            <span className="block text-xs text-muted-foreground">Signed in as</span>
            <span className="block truncate text-sm font-medium text-foreground">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/app")}>
            <LayoutGrid /> Your ideas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/app/new")}>
            <Plus /> New idea
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          closeOnClick={false}
          onClick={() => startSignOut(() => signOutAction())}
        >
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />} Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

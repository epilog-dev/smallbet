import Link from "next/link";
import { SmallbetMark } from "@/components/brand/Logo";
import { Container } from "./primitives/Container";
import type { PageContextValue } from "./types";

export function Footer({ ctx }: { ctx: PageContextValue }) {
  return (
    <footer className="border-t border-vp-border py-10">
      <Container className="flex flex-col items-start justify-between gap-4 text-sm text-vp-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {ctx.doc.meta.productName}. Pre-launch — nothing is charged.
        </p>
        <p className="flex items-center gap-1.5">
          Built with
          {ctx.mode === "live" ? (
            <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-vp-fg underline-offset-4 hover:underline">
              <SmallbetMark className="size-3.5" /> smallbet
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold text-vp-fg">
              <SmallbetMark className="size-3.5" /> smallbet
            </span>
          )}
        </p>
      </Container>
    </footer>
  );
}

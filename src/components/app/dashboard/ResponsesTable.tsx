"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/analytics/pricing-stats";
import type { ResponseRow } from "@/lib/db/responses";

const tierName = (r: ResponseRow, names: Record<string, string>) => (r.tier_id ? (names[r.tier_id] ?? r.tier_id) : "—");

export function ResponsesTable({ rows, tierNames, projectName }: { rows: ResponseRow[]; tierNames: Record<string, string>; projectName: string }) {
  const exportCsv = () => {
    const head = ["created_at", "answer", "tier", "amount", "currency", "interval", "email", "reason", "referrer"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [r.created_at, r.kind, tierName(r, tierNames), r.amount_cents != null ? r.amount_cents / 100 : "", r.currency ?? "", r.interval ?? "", r.email ?? "", r.reason ?? "", r.referrer ?? ""].map(esc).join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-responses.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No answers yet. Share the link — answers appear here as they come in.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "answer" : "answers"}
        </p>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="min-w-[16rem]">Why</TableHead>
              <TableHead>From</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                <TableCell>
                  <span className={r.kind === "would_pay" ? "font-medium" : "text-muted-foreground"}>{r.kind === "would_pay" ? "Would pay" : "Wouldn't pay"}</span>
                </TableCell>
                <TableCell>{tierName(r, tierNames)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.amount_cents != null ? formatMoney(r.amount_cents / 100, r.currency ?? "USD") : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
                <TableCell className="max-w-[24rem] whitespace-normal text-muted-foreground">{r.reason ?? "—"}</TableCell>
                <TableCell className="max-w-[10rem] truncate text-muted-foreground" title={r.referrer ?? ""}>
                  {r.referrer ? r.referrer.replace(/^https?:\/\//, "").split("/")[0] : "direct"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

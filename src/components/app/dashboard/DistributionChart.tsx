"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TierBucket } from "@/lib/analytics/pricing-stats";
import { formatMoney } from "@/lib/analytics/pricing-stats";

/** One measure (answers) per option: a single ink hue, with "wouldn't pay" in a neutral. */
export function DistributionChart({ buckets, currency, interval }: { buckets: TierBucket[]; currency: string; interval: string }) {
  const data = buckets.map((b) => ({
    ...b,
    name: b.price != null ? `${b.label} · ${formatMoney(b.price, currency)}${interval === "month" ? "/mo" : interval === "year" ? "/yr" : ""}` : b.label,
  }));
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} interval={0} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} domain={[0, Math.ceil(max * 1.15)]} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-muted-foreground">
                    {d.count} {d.count === 1 ? "answer" : "answers"} · {Math.round(d.share * 100)}%
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.id === "would_not_pay" ? "var(--muted-foreground)" : "var(--foreground)"} fillOpacity={d.id === "would_not_pay" ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon?: LucideIcon;
}

export function MetricCard({ label, value, delta, positive = true, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-leather/10 bg-white p-5 shadow-soft transition-shadow hover:shadow-premium">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink/60">{label}</p>
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-champagne/15">
            <Icon className="h-4 w-4 text-champagne" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-leather">{value}</p>
      {delta && (
        <p className={cn("mt-1 text-xs font-medium", positive ? "text-emerald-600" : "text-burgundy")}>
          {positive ? "▲" : "▼"} {delta}
        </p>
      )}
    </div>
  );
}

export interface DashboardMetricsProps {
  metrics: MetricCardProps[];
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}

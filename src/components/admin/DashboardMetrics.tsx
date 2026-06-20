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
    <div className="rounded-xl border border-premium/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-leather/60">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-champagne" />}
      </div>
      <p className="mt-2 font-display text-3xl text-leather">{value}</p>
      {delta && (
        <p className={cn("mt-1 text-xs", positive ? "text-emerald-600" : "text-burgundy")}>
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

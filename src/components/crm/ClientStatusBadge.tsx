import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, type LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

export function ClientStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        LEAD_STATUS_COLOR[status]
      )}
    >
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}

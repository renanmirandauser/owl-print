import { QUOTE_STATUS_LABEL, QUOTE_STATUS_COLOR, type QuoteStatus } from "@/types";
import { cn } from "@/lib/utils";

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        QUOTE_STATUS_COLOR[status]
      )}
    >
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}

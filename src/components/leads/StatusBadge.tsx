import { cn } from "@/lib/utils"
import { STATUS_CONFIG } from "@/data/config"
import type { LeadStatus } from "@/types/lead"

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

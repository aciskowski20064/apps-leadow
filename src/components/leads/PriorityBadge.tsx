import { cn } from "@/lib/utils"
import { PRIORITY_CONFIG } from "@/data/config"
import type { LeadPriority } from "@/types/lead"

export function PriorityBadge({
  priority,
  className,
}: {
  priority: LeadPriority
  className?: string
}) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  )
}

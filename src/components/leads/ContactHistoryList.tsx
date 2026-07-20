import { History } from "lucide-react"
import { formatDateTime } from "@/lib/dates"
import type { Activity } from "@/types/activity"

export function ContactHistoryList({ entries }: { entries: Activity[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Brak historii kontaktów.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <History className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground">{entry.description}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

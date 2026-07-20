import { Link } from "react-router-dom"
import { Pencil, Trash2, ArrowRight, ExternalLink, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriorityBadge } from "@/components/leads/PriorityBadge"
import { formatDate, isDateOverdue, isDateToday } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"
import type { Lead } from "@/types/lead"

interface TaskRowProps {
  task: Task
  lead?: Lead
  onToggleDone: (task: Task) => void
  onReschedule: (id: string, dueDate: string) => void
  onPostponeTomorrow: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskRow({
  task,
  lead,
  onToggleDone,
  onReschedule,
  onPostponeTomorrow,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const done = task.status === "Wykonane"

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <Checkbox
          checked={done}
          onCheckedChange={() => onToggleDone(task)}
          className="mt-0.5"
          aria-label={done ? "Oznacz jako niewykonane" : "Oznacz jako wykonane"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("text-sm font-medium text-foreground", done && "line-through opacity-60")}>
              {task.title}
            </p>
            <Badge variant="secondary">{task.type}</Badge>
            {task.isAutomaticallyCreated && (
              <Badge variant="outline" className="text-muted-foreground">
                auto
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
          )}
          {lead && (
            <Link
              to={`/leady/${lead.id}`}
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {lead.companyName} <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <PriorityBadge priority={task.priority} />
        <span
          className={cn(
            "text-xs",
            !done && isDateOverdue(task.dueDate) && "font-medium text-red-600 dark:text-red-400",
            !done && isDateToday(task.dueDate) && "font-medium text-amber-600 dark:text-amber-400",
            !task.dueDate && "text-muted-foreground"
          )}
        >
          {task.dueDate ? formatDate(task.dueDate) : "Bez terminu"}
        </span>
        <Input
          type="date"
          value={task.dueDate}
          onChange={(e) => onReschedule(task.id, e.target.value)}
          className="h-7 w-36 text-xs"
          aria-label="Zmień termin"
        />
        {!done && (
          <Button variant="outline" size="sm" onClick={() => onPostponeTomorrow(task.id)}>
            Jutro <ArrowRight className="size-3.5" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Więcej akcji" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="size-4" /> Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              <Trash2 className="size-4" /> Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

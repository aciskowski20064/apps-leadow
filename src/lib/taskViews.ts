import type { Task } from "@/types/task"
import { isDateOverdue, isDateToday, isoDateFromToday, todayISO } from "@/lib/dates"

export const TASK_VIEWS = [
  "dzisiaj",
  "zalegle",
  "najblizsze7",
  "bezTerminu",
  "wykonane",
  "wszystkie",
] as const

export type TaskView = (typeof TASK_VIEWS)[number]

export const TASK_VIEW_LABELS: Record<TaskView, string> = {
  dzisiaj: "Dzisiaj",
  zalegle: "Zaległe",
  najblizsze7: "Najbliższe 7 dni",
  bezTerminu: "Bez terminu",
  wykonane: "Wykonane",
  wszystkie: "Wszystkie",
}

const active = (t: Task) => t.status === "Do zrobienia"

export function filterTasksByView(tasks: Task[], view: TaskView): Task[] {
  switch (view) {
    case "dzisiaj":
      return tasks.filter((t) => active(t) && isDateToday(t.dueDate))
    case "zalegle":
      return tasks.filter((t) => active(t) && isDateOverdue(t.dueDate))
    case "najblizsze7": {
      const in7 = isoDateFromToday(7)
      const today = todayISO()
      return tasks.filter(
        (t) => active(t) && t.dueDate && t.dueDate > today && t.dueDate <= in7
      )
    }
    case "bezTerminu":
      return tasks.filter((t) => active(t) && !t.dueDate)
    case "wykonane":
      return tasks.filter((t) => t.status === "Wykonane")
    case "wszystkie":
      return tasks
  }
}

export function countOverdue(tasks: Task[]): number {
  return tasks.filter((t) => active(t) && isDateOverdue(t.dueDate)).length
}

export function countToday(tasks: Task[]): number {
  return tasks.filter((t) => active(t) && isDateToday(t.dueDate)).length
}

export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aKey = a.dueDate || "9999-99-99"
    const bKey = b.dueDate || "9999-99-99"
    return aKey.localeCompare(bKey)
  })
}

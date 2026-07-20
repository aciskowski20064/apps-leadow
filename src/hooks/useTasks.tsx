import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { TaskRepository } from "@/data/repositories/TaskRepository"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import type { Task, TaskFormValues } from "@/types/task"
import { isoDateFromToday } from "@/lib/dates"

interface TasksContextValue {
  tasks: Task[]
  loaded: boolean
  refresh: () => Promise<void>
  addTask: (values: TaskFormValues) => Promise<Task>
  updateTask: (id: string, changes: Partial<TaskFormValues>) => Promise<void>
  completeTask: (id: string) => Promise<void>
  reopenTask: (id: string) => Promise<void>
  rescheduleTask: (id: string, dueDate: string) => Promise<void>
  postponeToTomorrow: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const data = await TaskRepository.getAll()
    setTasks(data)
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addTask(values: TaskFormValues): Promise<Task> {
    const task = await TaskRepository.add(values)
    if (task.leadId) {
      await ActivityRepository.add(task.leadId, `Zaplanowano zadanie: ${task.title}`)
    }
    await refresh()
    return task
  }

  async function updateTask(id: string, changes: Partial<TaskFormValues>): Promise<void> {
    await TaskRepository.update(id, changes)
    await refresh()
  }

  async function completeTask(id: string): Promise<void> {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await TaskRepository.complete(id)
    if (task.leadId) {
      await ActivityRepository.add(task.leadId, `Zadanie wykonane: ${task.title}`)
    }
    await refresh()
  }

  async function reopenTask(id: string): Promise<void> {
    await TaskRepository.reopen(id)
    await refresh()
  }

  async function rescheduleTask(id: string, dueDate: string): Promise<void> {
    await TaskRepository.update(id, { dueDate })
    await refresh()
  }

  async function postponeToTomorrow(id: string): Promise<void> {
    await TaskRepository.update(id, { dueDate: isoDateFromToday(1) })
    await refresh()
  }

  async function deleteTask(id: string): Promise<void> {
    await TaskRepository.delete(id)
    await refresh()
  }

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loaded,
        refresh,
        addTask,
        updateTask,
        completeTask,
        reopenTask,
        rescheduleTask,
        postponeToTomorrow,
        deleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext)
  if (!ctx) {
    throw new Error("useTasks musi być używany wewnątrz TasksProvider")
  }
  return ctx
}

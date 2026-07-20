import type { LeadPriority } from "./lead.ts"

export const TASK_TYPES = ["Analiza", "Demo", "Wiadomość", "E-mail", "Telefon", "Inne"] as const

export type TaskType = (typeof TASK_TYPES)[number]

export const TASK_STATUSES = ["Do zrobienia", "Wykonane"] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task {
  id: string
  leadId?: string
  title: string
  description: string
  type: TaskType
  priority: LeadPriority
  dueDate: string
  status: TaskStatus
  completedAt: string
  createdAt: string
  updatedAt: string
  isAutomaticallyCreated: boolean
}

export type TaskFormValues = Omit<
  Task,
  "id" | "status" | "completedAt" | "createdAt" | "updatedAt" | "isAutomaticallyCreated"
>

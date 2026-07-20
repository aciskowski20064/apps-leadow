import { requireSupabase, requireUserId } from "@/lib/supabaseClient"
import { toCamelCaseObject, toSnakeCaseObject } from "@/lib/caseConvert"
import type { Task, TaskFormValues } from "@/types/task"

const TABLE = "tasks"

// Kolumna lead_id w Postgresie to uuid — puste/"brak" musi być `null`,
// nie `""` (co złamałoby walidację typu uuid po stronie bazy).
function taskRowFromTask(task: object): Record<string, unknown> {
  const row = toSnakeCaseObject(task)
  row.lead_id = (task as { leadId?: string }).leadId || null
  return row
}

function taskFromRow(row: Record<string, unknown>): Task {
  const task = toCamelCaseObject<Task>(row)
  return { ...task, leadId: (row.lead_id as string | null) ?? undefined }
}

export const TaskRepository = {
  async getAll(): Promise<Task[]> {
    const client = requireSupabase()
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(taskFromRow)
  },

  async getById(id: string): Promise<Task | undefined> {
    const client = requireSupabase()
    const { data, error } = await client.from(TABLE).select("*").eq("id", id).maybeSingle()
    if (error) throw error
    return data ? taskFromRow(data) : undefined
  },

  async getByLead(leadId: string): Promise<Task[]> {
    const client = requireSupabase()
    const { data, error } = await client.from(TABLE).select("*").eq("lead_id", leadId)
    if (error) throw error
    return (data ?? []).map(taskFromRow)
  },

  async getActiveByLead(leadId: string): Promise<Task[]> {
    const client = requireSupabase()
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .eq("lead_id", leadId)
      .eq("status", "Do zrobienia")
    if (error) throw error
    return (data ?? []).map(taskFromRow)
  },

  async add(values: TaskFormValues, options?: { isAutomaticallyCreated?: boolean }): Promise<Task> {
    const client = requireSupabase()
    const userId = await requireUserId()
    const row = {
      ...taskRowFromTask(values),
      user_id: userId,
      status: "Do zrobienia",
      completed_at: "",
      is_automatically_created: options?.isAutomaticallyCreated ?? false,
    }
    const { data, error } = await client.from(TABLE).insert(row).select().single()
    if (error) throw error
    return taskFromRow(data)
  },

  async update(id: string, changes: Partial<Task>): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).update(taskRowFromTask(changes)).eq("id", id)
    if (error) throw error
  },

  async complete(id: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client
      .from(TABLE)
      .update({ status: "Wykonane", completed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) throw error
  },

  async reopen(id: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client
      .from(TABLE)
      .update({ status: "Do zrobienia", completed_at: "" })
      .eq("id", id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).delete().eq("id", id)
    if (error) throw error
  },

  async deleteByLead(leadId: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).delete().eq("lead_id", leadId)
    if (error) throw error
  },

  async bulkInsert(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return
    const client = requireSupabase()
    const userId = await requireUserId()
    const rows = tasks.map((task) => ({ ...taskRowFromTask(task), user_id: userId }))
    const { error } = await client.from(TABLE).insert(rows)
    if (error) throw error
  },

  async replaceAll(tasks: Task[]): Promise<void> {
    await this.clear()
    await this.bulkInsert(tasks)
  },

  async clear(): Promise<void> {
    const client = requireSupabase()
    const userId = await requireUserId()
    const { error } = await client.from(TABLE).delete().eq("user_id", userId)
    if (error) throw error
  },

  async count(): Promise<number> {
    const client = requireSupabase()
    const { count, error } = await client.from(TABLE).select("*", { count: "exact", head: true })
    if (error) throw error
    return count ?? 0
  },
}

import { requireSupabase, requireUserId } from "@/lib/supabaseClient"
import { toCamelCaseObject, toSnakeCaseObject } from "@/lib/caseConvert"
import type { Activity } from "@/types/activity"

const TABLE = "activities"

export const ActivityRepository = {
  async getAll(): Promise<Activity[]> {
    const client = requireSupabase()
    const { data, error } = await client.from(TABLE).select("*").order("date", { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => toCamelCaseObject<Activity>(row))
  },

  async getByLead(leadId: string): Promise<Activity[]> {
    const client = requireSupabase()
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .eq("lead_id", leadId)
      .order("date", { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => toCamelCaseObject<Activity>(row))
  },

  async add(leadId: string, description: string, date?: string): Promise<Activity> {
    const client = requireSupabase()
    const userId = await requireUserId()
    const row = {
      user_id: userId,
      lead_id: leadId,
      description,
      date: date ?? new Date().toISOString(),
    }
    const { data, error } = await client.from(TABLE).insert(row).select().single()
    if (error) throw error
    return toCamelCaseObject<Activity>(data)
  },

  async deleteByLead(leadId: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).delete().eq("lead_id", leadId)
    if (error) throw error
  },

  async bulkInsert(activities: Activity[]): Promise<void> {
    if (activities.length === 0) return
    const client = requireSupabase()
    const userId = await requireUserId()
    const rows = activities.map((activity) => ({ ...toSnakeCaseObject(activity), user_id: userId }))
    const { error } = await client.from(TABLE).insert(rows)
    if (error) throw error
  },

  async replaceAll(activities: Activity[]): Promise<void> {
    await this.clear()
    await this.bulkInsert(activities)
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

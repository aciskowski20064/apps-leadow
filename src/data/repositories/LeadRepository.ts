import { requireSupabase, requireUserId } from "@/lib/supabaseClient"
import { toCamelCaseObject, toSnakeCaseObject } from "@/lib/caseConvert"
import type { Lead, LeadFormValues } from "@/types/lead"

const TABLE = "leads"

export const LeadRepository = {
  async getAll(): Promise<Lead[]> {
    const client = requireSupabase()
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => toCamelCaseObject<Lead>(row))
  },

  async getById(id: string): Promise<Lead | undefined> {
    const client = requireSupabase()
    const { data, error } = await client.from(TABLE).select("*").eq("id", id).maybeSingle()
    if (error) throw error
    return data ? toCamelCaseObject<Lead>(data) : undefined
  },

  async findByPlaceId(placeId: string): Promise<Lead | undefined> {
    if (!placeId) return undefined
    const client = requireSupabase()
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .eq("place_id", placeId)
      .maybeSingle()
    if (error) throw error
    return data ? toCamelCaseObject<Lead>(data) : undefined
  },

  async add(values: LeadFormValues): Promise<Lead> {
    const client = requireSupabase()
    const userId = await requireUserId()
    const row = { ...toSnakeCaseObject(values), user_id: userId, archived: false }
    const { data, error } = await client.from(TABLE).insert(row).select().single()
    if (error) throw error
    return toCamelCaseObject<Lead>(data)
  },

  async update(id: string, changes: Partial<Lead>): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).update(toSnakeCaseObject(changes)).eq("id", id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from(TABLE).delete().eq("id", id)
    if (error) throw error
  },

  async bulkInsert(leads: Lead[]): Promise<void> {
    if (leads.length === 0) return
    const client = requireSupabase()
    const userId = await requireUserId()
    const rows = leads.map((lead) => ({ ...toSnakeCaseObject(lead), user_id: userId }))
    const { error } = await client.from(TABLE).insert(rows)
    if (error) throw error
  },

  async replaceAll(leads: Lead[]): Promise<void> {
    await this.clear()
    await this.bulkInsert(leads)
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

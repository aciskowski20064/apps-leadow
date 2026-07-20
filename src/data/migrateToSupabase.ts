import { db } from "@/data/db"
import { LeadRepository } from "@/data/repositories/LeadRepository"
import { TaskRepository } from "@/data/repositories/TaskRepository"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import { exportAllDataToJson } from "@/lib/importExport"
import type { FullDataset } from "@/data/dataService"

export async function getLocalIndexedDbData(): Promise<FullDataset> {
  const [leads, tasks, activities] = await Promise.all([
    db.leads.toArray(),
    db.tasks.toArray(),
    db.activities.toArray(),
  ])
  return { leads, tasks, activities }
}

export async function hasLocalIndexedDbData(): Promise<boolean> {
  const count = await db.leads.count()
  return count > 0
}

/**
 * Migruje dane z lokalnego IndexedDB (dawny magazyn aplikacji) do Supabase:
 * 1) najpierw automatyczny eksport kopii JSON — backup na wypadek błędu,
 * 2) dopiero potem wgranie leadów/zadań/aktywności do Supabase.
 * Zakłada, że konto Supabase jest puste dla tego użytkownika (doklejamy, nie
 * nadpisujemy). Dane lokalne NIE są usuwane — to osobny krok, potwierdzany
 * ręcznie przez użytkownika w UI.
 */
export async function migrateLocalDataToSupabase(data: FullDataset): Promise<void> {
  exportAllDataToJson(data)
  await LeadRepository.bulkInsert(data.leads)
  await TaskRepository.bulkInsert(data.tasks)
  await ActivityRepository.bulkInsert(data.activities)
}

export async function clearLocalIndexedDbData(): Promise<void> {
  await db.transaction("rw", db.leads, db.tasks, db.activities, async () => {
    await db.leads.clear()
    await db.tasks.clear()
    await db.activities.clear()
  })
}

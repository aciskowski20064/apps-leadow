import { db } from "@/data/db"
import { hasLegacyLeads, loadLegacyLeads, generateId } from "@/data/storage"
import type { Lead } from "@/types/lead"
import type { Task, TaskType } from "@/types/task"
import type { Activity } from "@/types/activity"
import { TASK_TYPES } from "@/types/task"

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []
}

function toTaskType(value: unknown): TaskType {
  return typeof value === "string" && (TASK_TYPES as readonly string[]).includes(value)
    ? (value as TaskType)
    : "Inne"
}

/**
 * Konwertuje leada w starym formacie (z osadzonym nextAction/contactHistory)
 * na: czysty rekord Lead + (opcjonalnie) jedno aktywne zadanie + wpisy Activity.
 */
function migrateLegacyLead(raw: Record<string, unknown>): {
  lead: Lead
  task: Task | null
  activities: Activity[]
} {
  const now = new Date().toISOString()
  const id = str(raw.id) || generateId()
  const createdAt = str(raw.createdAt, now)

  const lead: Lead = {
    id,
    companyName: str(raw.companyName),
    industry: (str(raw.industry, "Inne") as Lead["industry"]) || "Inne",
    city: str(raw.city),
    phone: str(raw.phone),
    email: str(raw.email),
    socialLink: str(raw.socialLink),
    googleMapsLink: str(raw.googleMapsLink),
    currentWebsite: str(raw.currentWebsite),
    demoLink: str(raw.demoLink),
    source: str(raw.source),
    status: (str(raw.status, "Nowy lead") as Lead["status"]) || "Nowy lead",
    priority: (str(raw.priority, "Średni") as Lead["priority"]) || "Średni",
    dateAdded: str(raw.dateAdded),
    lastContactDate: str(raw.lastContactDate),
    notes: str(raw.notes),
    archived: bool(raw.archived),
    createdAt,
    updatedAt: str(raw.updatedAt, createdAt),
    placeId: str(raw.placeId),
    fullAddress: str(raw.fullAddress),
    googleCategory: str(raw.googleCategory),
    googleRating: num(raw.googleRating),
    googleReviewsCount: num(raw.googleReviewsCount),
    businessStatus: str(raw.businessStatus),
    openingHours: strArray(raw.openingHours),
  }

  const nextAction = str(raw.nextAction)
  const task: Task | null = nextAction
    ? {
        id: generateId(),
        leadId: id,
        title: nextAction,
        description: "",
        type: toTaskType(raw.nextActionType),
        priority: lead.priority,
        dueDate: str(raw.nextActionDate),
        status: "Do zrobienia",
        completedAt: "",
        createdAt,
        updatedAt: createdAt,
        isAutomaticallyCreated: false,
      }
    : null

  const legacyHistory = Array.isArray(raw.contactHistory) ? raw.contactHistory : []
  const activities: Activity[] = legacyHistory
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      id: str(entry.id) || generateId(),
      leadId: id,
      description: str(entry.description),
      date: str(entry.date, createdAt),
    }))

  return { lead, task, activities }
}

/**
 * Uruchamiana raz, przed pierwszym renderem aplikacji. Jeśli w tej przeglądarce
 * zalega jeszcze stary localStorage (sprzed wprowadzenia IndexedDB) i lokalne
 * IndexedDB jest puste — migruje go do IndexedDB, żeby późniejsza migracja do
 * Supabase (ręczna, w widoku Dane) miała skąd wziąć dane. Nie usuwa starego
 * wpisu w localStorage — zostaje jako nietknięta kopia zapasowa. Świeża
 * instalacja (bez żadnych starych danych) nic tu nie robi — Supabase jest
 * teraz głównym źródłem danych, demo można załadować bezpośrednio w widoku Dane.
 */
export async function migrateToIndexedDbIfNeeded(): Promise<void> {
  if (!hasLegacyLeads()) return

  const existingCount = await db.leads.count()
  if (existingCount > 0) return

  const legacyLeads = loadLegacyLeads()
  const leads: Lead[] = []
  const tasks: Task[] = []
  const activities: Activity[] = []

  for (const raw of legacyLeads) {
    const migrated = migrateLegacyLead(raw)
    leads.push(migrated.lead)
    if (migrated.task) tasks.push(migrated.task)
    activities.push(...migrated.activities)
  }

  await db.transaction("rw", db.leads, db.tasks, db.activities, async () => {
    await db.leads.bulkPut(leads)
    await db.tasks.bulkPut(tasks)
    await db.activities.bulkPut(activities)
  })
}

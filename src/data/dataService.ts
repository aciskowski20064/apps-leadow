import { LeadRepository } from "@/data/repositories/LeadRepository"
import { TaskRepository } from "@/data/repositories/TaskRepository"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import { createDemoData } from "@/data/demoData"
import type { Lead } from "@/types/lead"
import type { Task } from "@/types/task"
import type { Activity } from "@/types/activity"

export interface FullDataset {
  leads: Lead[]
  tasks: Task[]
  activities: Activity[]
}

export async function getAllData(): Promise<FullDataset> {
  const [leads, tasks, activities] = await Promise.all([
    LeadRepository.getAll(),
    TaskRepository.getAll(),
    ActivityRepository.getAll(),
  ])
  return { leads, tasks, activities }
}

export async function replaceAllData(data: FullDataset): Promise<void> {
  // Supabase (przez supabase-js) nie ma tu wielotabelowej transakcji jak
  // Dexie — kolejność więc pilnujemy ręcznie przez klucze obce: najpierw
  // czyścimy dzieci, potem rodzica; przy wstawianiu odwrotnie.
  await TaskRepository.clear()
  await ActivityRepository.clear()
  await LeadRepository.clear()

  await LeadRepository.bulkInsert(data.leads)
  await TaskRepository.bulkInsert(data.tasks)
  await ActivityRepository.bulkInsert(data.activities)
}

export async function loadDemoData(): Promise<void> {
  await replaceAllData(createDemoData())
}

export async function clearAllData(): Promise<void> {
  await replaceAllData({ leads: [], tasks: [], activities: [] })
}

import Dexie, { type EntityTable } from "dexie"
import type { Lead } from "@/types/lead"
import type { Task } from "@/types/task"
import type { Activity } from "@/types/activity"

export class LeadowDB extends Dexie {
  leads!: EntityTable<Lead, "id">
  tasks!: EntityTable<Task, "id">
  activities!: EntityTable<Activity, "id">

  constructor() {
    super("LeadowCRM")
    this.version(1).stores({
      leads: "id, placeId, status, priority, archived, city, industry, createdAt",
      tasks: "id, leadId, status, dueDate, type, isAutomaticallyCreated, createdAt",
      activities: "id, leadId, date",
    })
  }
}

export const db = new LeadowDB()

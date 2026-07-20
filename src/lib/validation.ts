import { z } from "zod"
import { LEAD_CATEGORIES, LEAD_PRIORITIES, LEAD_STATUSES } from "@/types/lead"
import { TASK_TYPES, TASK_STATUSES } from "@/types/task"

export const loginSchema = z.object({
  email: z.email("Podaj poprawny adres e-mail"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
})

export type LoginSchema = z.infer<typeof loginSchema>

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value) || /^www\..+/i.test(value),
    "Podaj poprawny adres URL (zaczynający się od http:// lub www.)"
  )

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Podaj poprawny adres e-mail"
  )

export const leadFormSchema = z.object({
  companyName: z.string().trim().min(2, "Nazwa firmy musi mieć co najmniej 2 znaki"),
  industry: z.enum(LEAD_CATEGORIES, "Wybierz branżę"),
  city: z.string().trim().min(2, "Podaj miasto"),
  phone: z.string().trim(),
  email: optionalEmail,
  socialLink: optionalUrl,
  googleMapsLink: optionalUrl,
  currentWebsite: optionalUrl,
  demoLink: optionalUrl,
  source: z.string().trim(),
  status: z.enum(LEAD_STATUSES, "Wybierz status"),
  priority: z.enum(LEAD_PRIORITIES, "Wybierz priorytet"),
  dateAdded: z.string().min(1, "Podaj datę dodania"),
  lastContactDate: z.string(),
  notes: z.string().trim(),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

export const googleImportSchema = z.object({
  companyName: z.string().trim().min(2, "Nazwa firmy musi mieć co najmniej 2 znaki"),
  industry: z.enum(LEAD_CATEGORIES, "Wybierz branżę"),
  city: z.string().trim().min(2, "Podaj miasto"),
  phone: z.string().trim(),
  currentWebsite: optionalUrl,
  status: z.enum(LEAD_STATUSES, "Wybierz status"),
  priority: z.enum(LEAD_PRIORITIES, "Wybierz priorytet"),
  taskType: z.enum(TASK_TYPES).or(z.literal("")),
  taskDate: z.string(),
})

export type GoogleImportSchema = z.infer<typeof googleImportSchema>

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, "Tytuł zadania musi mieć co najmniej 2 znaki"),
  description: z.string().trim(),
  type: z.enum(TASK_TYPES, "Wybierz typ zadania"),
  priority: z.enum(LEAD_PRIORITIES, "Wybierz priorytet"),
  dueDate: z.string(),
  leadId: z.string(),
})

export type TaskFormSchema = z.infer<typeof taskFormSchema>

// --- Walidacja pełnego importu danych (Dane -> Importuj z pliku JSON) ---

const leadRecordSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  industry: z.enum(LEAD_CATEGORIES),
  city: z.string(),
  phone: z.string(),
  email: z.string(),
  socialLink: z.string(),
  googleMapsLink: z.string(),
  currentWebsite: z.string(),
  demoLink: z.string(),
  source: z.string(),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  dateAdded: z.string(),
  lastContactDate: z.string(),
  notes: z.string(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  placeId: z.string(),
  fullAddress: z.string(),
  googleCategory: z.string(),
  googleRating: z.number(),
  googleReviewsCount: z.number(),
  businessStatus: z.string(),
  openingHours: z.array(z.string()),
})

const taskRecordSchema = z.object({
  id: z.string(),
  leadId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  type: z.enum(TASK_TYPES),
  priority: z.enum(LEAD_PRIORITIES),
  dueDate: z.string(),
  status: z.enum(TASK_STATUSES),
  completedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isAutomaticallyCreated: z.boolean(),
})

const activityRecordSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  description: z.string(),
  date: z.string(),
})

export const importDataSchema = z.object({
  version: z.number(),
  leads: z.array(leadRecordSchema),
  tasks: z.array(taskRecordSchema),
  activities: z.array(activityRecordSchema),
})

export type ImportDataSchema = z.infer<typeof importDataSchema>

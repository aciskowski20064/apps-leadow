import type { LeadCategory, LeadPriority, LeadStatus } from "../types/lead.ts"
import type { TaskType } from "../types/task.ts"

interface StatusConfig {
  label: LeadStatus
  className: string
}

export const STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  "Nowy lead": {
    label: "Nowy lead",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  },
  "Do analizy": {
    label: "Do analizy",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
  },
  "Przygotowanie demo": {
    label: "Przygotowanie demo",
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
  },
  "Do kontaktu": {
    label: "Do kontaktu",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  "Wiadomość wysłana": {
    label: "Wiadomość wysłana",
    className:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
  },
  "Czekam na odpowiedź": {
    label: "Czekam na odpowiedź",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  },
  "Follow-up": {
    label: "Follow-up",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30",
  },
  Zainteresowany: {
    label: "Zainteresowany",
    className:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
  },
  "Oferta cenowa": {
    label: "Oferta cenowa",
    className:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
  },
  Klient: {
    label: "Klient",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  Odrzucony: {
    label: "Odrzucony",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  "Brak odpowiedzi": {
    label: "Brak odpowiedzi",
    className:
      "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-500/15 dark:text-neutral-300 dark:border-neutral-500/30",
  },
}

interface PriorityConfig {
  label: LeadPriority
  className: string
  dotClassName: string
}

export const PRIORITY_CONFIG: Record<LeadPriority, PriorityConfig> = {
  Wysoki: {
    label: "Wysoki",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    dotClassName: "bg-red-500",
  },
  Średni: {
    label: "Średni",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dotClassName: "bg-amber-500",
  },
  Niski: {
    label: "Niski",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dotClassName: "bg-slate-400",
  },
}

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  Restauracje: "Restauracje",
  Pizzerie: "Pizzerie",
  "Bary i street food": "Bary i street food",
  Kawiarnie: "Kawiarnie",
  "Salony fryzjerskie": "Salony fryzjerskie",
  Beauty: "Beauty",
  Fizjoterapia: "Fizjoterapia",
  "Usługi lokalne": "Usługi lokalne",
  Edukacja: "Edukacja",
  Inne: "Inne",
}

export const LEAD_SOURCE_SUGGESTIONS = [
  "Google Maps",
  "Instagram",
  "Facebook",
  "Polecenie",
  "Cold mailing",
  "Cold calling",
  "Strona własna",
  "Networking",
  "Inne",
]

// Mapowanie typów zwracanych przez Google Places API na kategorie leada.
// Kolejność ma znaczenie — sprawdzane od góry, pierwsze trafienie wygrywa.
export const GOOGLE_TYPE_TO_CATEGORY: [string, LeadCategory][] = [
  ["meal_takeaway", "Bary i street food"],
  ["meal_delivery", "Bary i street food"],
  ["bar", "Bary i street food"],
  ["night_club", "Bary i street food"],
  ["cafe", "Kawiarnie"],
  ["bakery", "Kawiarnie"],
  ["restaurant", "Restauracje"],
  ["hair_care", "Salony fryzjerskie"],
  ["beauty_salon", "Beauty"],
  ["spa", "Beauty"],
  ["physiotherapist", "Fizjoterapia"],
  ["school", "Edukacja"],
  ["university", "Edukacja"],
  ["primary_school", "Edukacja"],
  ["secondary_school", "Edukacja"],
]

export const BUSINESS_STATUS_LABELS: Record<string, string> = {
  OPERATIONAL: "Czynne",
  CLOSED_TEMPORARILY: "Tymczasowo zamknięte",
  CLOSED_PERMANENTLY: "Trwale zamknięte",
}

interface TaskTypeConfig {
  label: TaskType
  defaultTaskLabel: string
  defaultDaysOffset: number
}

export const TASK_TYPE_CONFIG: Record<TaskType, TaskTypeConfig> = {
  Analiza: {
    label: "Analiza",
    defaultTaskLabel: "Przeanalizować firmę",
    defaultDaysOffset: 1,
  },
  Demo: {
    label: "Demo",
    defaultTaskLabel: "Przygotować demo",
    defaultDaysOffset: 3,
  },
  Wiadomość: {
    label: "Wiadomość",
    defaultTaskLabel: "Napisać wiadomość",
    defaultDaysOffset: 0,
  },
  "E-mail": {
    label: "E-mail",
    defaultTaskLabel: "Wysłać e-mail",
    defaultDaysOffset: 0,
  },
  Telefon: {
    label: "Telefon",
    defaultTaskLabel: "Zadzwonić",
    defaultDaysOffset: 0,
  },
  Inne: {
    label: "Inne",
    defaultTaskLabel: "Zadanie",
    defaultDaysOffset: 1,
  },
}

export interface QuickActionConfig {
  key: string
  label: string
  targetStatus: LeadStatus
  nextTask: { type: TaskType; label: string; daysOffset: number } | null
}

// Każda szybka akcja: zmienia status, zamyka bieżące zadanie (log do historii)
// i — jeśli nextTask nie jest null — planuje kolejne zadanie wg reguły follow-upu.
export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    key: "demo-w-przygotowaniu",
    label: "Demo w przygotowaniu",
    targetStatus: "Przygotowanie demo",
    nextTask: { type: "Demo", label: "Dokończyć i wysłać demo", daysOffset: 2 },
  },
  {
    key: "demo-gotowe",
    label: "Demo gotowe",
    targetStatus: "Do kontaktu",
    nextTask: { type: "Wiadomość", label: "Wysłać demo do klienta", daysOffset: 0 },
  },
  {
    key: "wiadomosc-wyslana",
    label: "Wiadomość wysłana",
    targetStatus: "Wiadomość wysłana",
    nextTask: { type: "Wiadomość", label: "Sprawdzić odpowiedź na wiadomość", daysOffset: 3 },
  },
  {
    key: "email-wyslany",
    label: "E-mail wysłany",
    targetStatus: "Wiadomość wysłana",
    nextTask: { type: "E-mail", label: "Sprawdzić odpowiedź na e-mail", daysOffset: 3 },
  },
  {
    key: "zadzwoniono",
    label: "Zadzwoniono",
    targetStatus: "Czekam na odpowiedź",
    nextTask: { type: "Telefon", label: "Zadzwonić ponownie", daysOffset: 3 },
  },
  {
    key: "odpowiedzial",
    label: "Odpowiedział",
    targetStatus: "Follow-up",
    nextTask: { type: "Telefon", label: "Skontaktować się — klient odpowiedział", daysOffset: 1 },
  },
  {
    key: "zainteresowany",
    label: "Zainteresowany",
    targetStatus: "Zainteresowany",
    nextTask: { type: "Wiadomość", label: "Przygotować i wysłać wycenę", daysOffset: 2 },
  },
  {
    key: "wycena-wyslana",
    label: "Wycena wysłana",
    targetStatus: "Oferta cenowa",
    nextTask: { type: "Telefon", label: "Zapytać o decyzję ws. wyceny", daysOffset: 4 },
  },
  {
    key: "klient",
    label: "Klient",
    targetStatus: "Klient",
    nextTask: null,
  },
  {
    key: "odrzucony",
    label: "Odrzucony",
    targetStatus: "Odrzucony",
    nextTask: null,
  },
]

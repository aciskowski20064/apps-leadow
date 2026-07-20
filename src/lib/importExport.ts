import { z } from "zod"
import type { Lead } from "@/types/lead"
import { importDataSchema } from "@/lib/validation"
import type { FullDataset } from "@/data/dataService"

const EXPORT_VERSION = 1

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAllDataToJson(data: FullDataset) {
  const payload = { version: EXPORT_VERSION, ...data }
  const content = JSON.stringify(payload, null, 2)
  triggerDownload(content, `leadow-crm-${new Date().toISOString().slice(0, 10)}.json`, "application/json")
}

const CSV_COLUMNS: { key: keyof Lead; header: string }[] = [
  { key: "companyName", header: "Nazwa firmy" },
  { key: "industry", header: "Branża" },
  { key: "city", header: "Miasto" },
  { key: "phone", header: "Telefon" },
  { key: "email", header: "E-mail" },
  { key: "socialLink", header: "Facebook/Instagram" },
  { key: "googleMapsLink", header: "Google Maps" },
  { key: "currentWebsite", header: "Obecna strona" },
  { key: "demoLink", header: "Demo" },
  { key: "source", header: "Źródło" },
  { key: "status", header: "Status" },
  { key: "priority", header: "Priorytet" },
  { key: "dateAdded", header: "Data dodania" },
  { key: "lastContactDate", header: "Ostatni kontakt" },
  { key: "notes", header: "Notatki" },
]

function escapeCsvValue(value: unknown): string {
  const str = String(value ?? "")
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportLeadsToCsv(leads: Lead[]) {
  const header = CSV_COLUMNS.map((col) => escapeCsvValue(col.header)).join(",")
  const rows = leads.map((lead) =>
    CSV_COLUMNS.map((col) => escapeCsvValue(lead[col.key])).join(",")
  )
  const content = ["﻿" + header, ...rows].join("\n")
  triggerDownload(content, `leady-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8")
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function parseImportedData(jsonText: string): FullDataset {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error("Plik nie zawiera poprawnego JSON-a.")
  }

  const result = importDataSchema.safeParse(parsed)
  if (!result.success) {
    const firstIssue = z.prettifyError(result.error).split("\n")[0]
    throw new Error(`Nieprawidłowa struktura pliku eksportu: ${firstIssue}`)
  }

  return {
    leads: result.data.leads,
    tasks: result.data.tasks,
    activities: result.data.activities,
  }
}

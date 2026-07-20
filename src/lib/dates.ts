import { format, isPast, isToday, parseISO } from "date-fns"
import { pl } from "date-fns/locale"

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isoDateFromToday(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: pl })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: pl })
  } catch {
    return iso
  }
}

export function isDateToday(iso: string | undefined | null): boolean {
  if (!iso) return false
  try {
    return isToday(parseISO(iso))
  } catch {
    return false
  }
}

export function isDateOverdue(iso: string | undefined | null): boolean {
  if (!iso) return false
  try {
    const date = parseISO(iso)
    return isPast(date) && !isToday(date)
  } catch {
    return false
  }
}

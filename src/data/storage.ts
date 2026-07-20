const STORAGE_KEY = "crm-leadow:leads"

export function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Odczyt starych danych (sprzed migracji na IndexedDB) zapisanych jako pojedyncza
 * tablica leadów w localStorage. Kształt jest celowo luźny (`Record<string, unknown>`),
 * bo zawiera pola (nextAction, contactHistory) usunięte z aktualnego typu Lead.
 */
export function loadLegacyLeads(): Record<string, unknown>[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function hasLegacyLeads(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

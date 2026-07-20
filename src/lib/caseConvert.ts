// Tabele Supabase używają snake_case (konwencja Postgresa), a typy aplikacji
// camelCase. Te funkcje zamieniają klucze obiektu w jedną i drugą stronę, bez
// dotykania wartości — więc działają dla wszystkich encji bez ręcznego
// wypisywania każdego pola osobno.

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

export function toSnakeCaseObject(obj: object): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }
  return result
}

export function toCamelCaseObject<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value
  }
  return result as T
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Gdy brakuje konfiguracji, eksportujemy `null` zamiast rzucać wyjątkiem przy
// starcie aplikacji — pozwala to pokazać czytelny ekran "skonfiguruj Supabase"
// zamiast białego ekranu z błędem.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase nie jest skonfigurowane. Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w pliku .env."
    )
  }
  return supabase
}

export async function requireUserId(): Promise<string> {
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error || !data.session) {
    throw new Error("Brak zalogowanego użytkownika.")
  }
  return data.session.user.id
}

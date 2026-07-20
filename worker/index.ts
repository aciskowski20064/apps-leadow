import { lookupGooglePlace } from "../server/googlePlaces.ts"

interface Env {
  GOOGLE_PLACES_API_KEY?: string
  ASSETS: Fetcher
}

// Tylko prawdziwe linki Google Maps — bez tego endpoint mógłby posłużyć jako
// otwarty proxy do dowolnych adresów (SSRF).
const ALLOWED_HOSTNAMES = ["google.com", "goo.gl"]

function isAllowedGoogleMapsUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== "https:") return false
    return ALLOWED_HOSTNAMES.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("Przekroczono limit czasu odpowiedzi Google Places API.")),
        ms
      )
    ),
  ])
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

async function handlePlacesLookup(
  request: Request,
  apiKey: string | undefined
): Promise<Response> {
  if (!apiKey) {
    return json(
      {
        error:
          "Import z Google Maps nie jest skonfigurowany na tym środowisku (brak sekretu GOOGLE_PLACES_API_KEY).",
      },
      500
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: "Nieprawidłowe żądanie — oczekiwano JSON-a." }, 400)
  }

  const url = (body as { url?: unknown } | null)?.url
  if (!url || typeof url !== "string") {
    return json({ error: "Brak linku do Google Maps." }, 400)
  }
  if (!isAllowedGoogleMapsUrl(url)) {
    return json(
      { error: "To nie wygląda na link do Google Maps. Wklej link z przycisku „Udostępnij”." },
      400
    )
  }

  try {
    const result = await withTimeout(lookupGooglePlace(url, apiKey), 10_000)
    return json(result, 200)
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Nieznany błąd podczas pobierania danych." },
      502
    )
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/api/places/lookup") {
      if (request.method !== "POST") {
        return json({ error: "Metoda niedozwolona. Użyj POST." }, 405)
      }
      return handlePlacesLookup(request, env.GOOGLE_PLACES_API_KEY)
    }

    // Wszystko inne: statyczne pliki appki (dist/) + fallback SPA z wrangler.toml.
    return env.ASSETS.fetch(request)
  },
}

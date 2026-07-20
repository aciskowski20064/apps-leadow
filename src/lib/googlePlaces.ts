import type { GooglePlaceResult } from "@/types/googlePlaces"

export async function fetchGooglePlace(url: string): Promise<GooglePlaceResult> {
  const res = await fetch("/api/places/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error ?? "Nie udało się pobrać danych z Google Maps.")
  }

  return data as GooglePlaceResult
}

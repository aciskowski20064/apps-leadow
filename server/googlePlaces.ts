import type { GooglePlaceResult } from "../src/types/googlePlaces.ts"
import { GOOGLE_TYPE_TO_CATEGORY, BUSINESS_STATUS_LABELS } from "../src/data/config.ts"
import type { LeadCategory } from "../src/types/lead.ts"

const FIND_PLACE_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

function extractPlaceIdFromUrl(url: string): string | null {
  const queryPlaceId = url.match(/[?&]query_place_id=([^&]+)/)
  if (queryPlaceId) return decodeURIComponent(queryPlaceId[1])
  const placeIdParam = url.match(/[?&]place_id=([^&]+)/)
  if (placeIdParam) return decodeURIComponent(placeIdParam[1])
  // Format spotykany w linkach "Udostępnij": ?q=place_id:ChIJ... lub luźne place_id:XXX
  const colonForm = url.match(/place_id:([\w-]+)/)
  if (colonForm) return decodeURIComponent(colonForm[1])
  return null
}

function extractNameAndLocation(url: string): {
  name: string | null
  lat: number | null
  lng: number | null
} {
  const nameMatch = url.match(/\/maps\/place\/([^/@?]+)/)
  const name = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, " ")) : null
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  return {
    name,
    lat: atMatch ? parseFloat(atMatch[1]) : null,
    lng: atMatch ? parseFloat(atMatch[2]) : null,
  }
}

async function resolveShortLink(url: string): Promise<string> {
  if (!/goo\.gl/i.test(url)) return url
  try {
    const res = await fetch(url, { redirect: "follow" })
    return res.url || url
  } catch {
    return url
  }
}

function mapCategory(types: string[]): LeadCategory {
  for (const [googleType, category] of GOOGLE_TYPE_TO_CATEGORY) {
    if (types.includes(googleType)) return category
  }
  return "Inne"
}

function guessCity(formattedAddress: string): string {
  const parts = formattedAddress.split(",").map((p) => p.trim())
  const candidate = parts[parts.length - 2] ?? parts[0] ?? ""
  const withoutPostalCode = candidate.replace(/^\d{2}-\d{3}\s+/, "")
  return withoutPostalCode || candidate
}

interface GoogleDetailsResult {
  place_id?: string
  name?: string
  formatted_address?: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  business_status?: string
  opening_hours?: { weekday_text?: string[] }
  types?: string[]
  url?: string
}

interface FindPlaceResponse {
  status: string
  candidates?: { place_id?: string }[]
}

interface PlaceDetailsResponse {
  status: string
  result?: GoogleDetailsResult
}

export async function lookupGooglePlace(
  rawUrl: string,
  apiKey: string
): Promise<GooglePlaceResult> {
  const trimmedUrl = rawUrl.trim()
  if (!trimmedUrl) {
    throw new Error("Wklej link do wizytówki firmy w Google Maps.")
  }

  const resolvedUrl = await resolveShortLink(trimmedUrl)
  let placeId = extractPlaceIdFromUrl(resolvedUrl)

  if (!placeId) {
    const { name, lat, lng } = extractNameAndLocation(resolvedUrl)
    if (!name) {
      throw new Error(
        "Nie udało się rozpoznać linku do Google Maps. Wklej pełny link do wizytówki firmy (przycisk „Udostępnij” na karcie miejsca)."
      )
    }
    const params = new URLSearchParams({
      input: name,
      inputtype: "textquery",
      fields: "place_id",
      language: "pl",
      key: apiKey,
    })
    if (lat !== null && lng !== null) {
      params.set("locationbias", `point:${lat},${lng}`)
    }
    const findRes = await fetch(`${FIND_PLACE_URL}?${params.toString()}`)
    const findData = (await findRes.json()) as FindPlaceResponse
    if (findData.status !== "OK" || !findData.candidates?.[0]?.place_id) {
      throw new Error(
        `Nie znaleziono firmy w Google Maps dla podanego linku (status: ${findData.status ?? "nieznany"}).`
      )
    }
    placeId = findData.candidates[0].place_id
  }

  if (!placeId) {
    throw new Error("Nie udało się ustalić identyfikatora miejsca (place_id).")
  }

  const detailsParams = new URLSearchParams({
    place_id: placeId,
    fields:
      "place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,business_status,opening_hours,types,url",
    language: "pl",
    key: apiKey,
  })
  const detailsRes = await fetch(`${DETAILS_URL}?${detailsParams.toString()}`)
  const detailsData = (await detailsRes.json()) as PlaceDetailsResponse

  if (detailsData.status !== "OK" || !detailsData.result) {
    throw new Error(`Google Places API zwróciło błąd: ${detailsData.status ?? "nieznany"}.`)
  }

  const r = detailsData.result
  const types = r.types ?? []

  return {
    placeId: r.place_id ?? placeId,
    companyName: r.name ?? "",
    fullAddress: r.formatted_address ?? "",
    city: r.formatted_address ? guessCity(r.formatted_address) : "",
    industry: mapCategory(types),
    googleCategory: types[0] ?? "",
    phone: r.formatted_phone_number ?? r.international_phone_number ?? "",
    currentWebsite: r.website ?? "",
    googleRating: r.rating ?? 0,
    googleReviewsCount: r.user_ratings_total ?? 0,
    businessStatus: r.business_status
      ? (BUSINESS_STATUS_LABELS[r.business_status] ?? r.business_status)
      : "",
    openingHours: r.opening_hours?.weekday_text ?? [],
    googleMapsLink: r.url ?? trimmedUrl,
  }
}

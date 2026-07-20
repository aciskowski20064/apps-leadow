import type { LeadCategory } from "./lead.ts"

export interface GooglePlaceResult {
  placeId: string
  companyName: string
  fullAddress: string
  city: string
  industry: LeadCategory
  googleCategory: string
  phone: string
  currentWebsite: string
  googleRating: number
  googleReviewsCount: number
  businessStatus: string
  openingHours: string[]
  googleMapsLink: string
}

export interface GooglePlaceLookupError {
  error: string
}

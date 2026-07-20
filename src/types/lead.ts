export const LEAD_STATUSES = [
  "Nowy lead",
  "Do analizy",
  "Przygotowanie demo",
  "Do kontaktu",
  "Wiadomość wysłana",
  "Czekam na odpowiedź",
  "Follow-up",
  "Zainteresowany",
  "Oferta cenowa",
  "Klient",
  "Odrzucony",
  "Brak odpowiedzi",
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_PRIORITIES = ["Wysoki", "Średni", "Niski"] as const

export type LeadPriority = (typeof LEAD_PRIORITIES)[number]

export const LEAD_CATEGORIES = [
  "Restauracje",
  "Pizzerie",
  "Bary i street food",
  "Kawiarnie",
  "Salony fryzjerskie",
  "Beauty",
  "Fizjoterapia",
  "Usługi lokalne",
  "Edukacja",
  "Inne",
] as const

export type LeadCategory = (typeof LEAD_CATEGORIES)[number]

export interface Lead {
  id: string
  companyName: string
  industry: LeadCategory
  city: string
  phone: string
  email: string
  socialLink: string
  googleMapsLink: string
  currentWebsite: string
  demoLink: string
  source: string
  status: LeadStatus
  priority: LeadPriority
  dateAdded: string
  lastContactDate: string
  notes: string
  archived: boolean
  createdAt: string
  updatedAt: string
  // Dane z importu Google Maps (puste, jeśli lead nie pochodzi z importu)
  placeId: string
  fullAddress: string
  googleCategory: string
  googleRating: number
  googleReviewsCount: number
  businessStatus: string
  openingHours: string[]
}

export type LeadFormValues = Omit<Lead, "id" | "archived" | "createdAt" | "updatedAt">

export const STATUSES_WON: LeadStatus[] = ["Klient"]
export const STATUSES_LOST: LeadStatus[] = ["Odrzucony", "Brak odpowiedzi"]

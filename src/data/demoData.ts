import type { Lead } from "@/types/lead"
import type { Task, TaskType } from "@/types/task"
import type { Activity } from "@/types/activity"
import { generateId } from "@/data/storage"
import { isoDateFromToday } from "@/lib/dates"

const daysFromToday = isoDateFromToday

type DemoLeadSpec = Partial<Lead> &
  Pick<Lead, "companyName" | "industry" | "city"> & {
    task?: { title: string; type: TaskType; dueDate: string }
  }

function buildLead(spec: DemoLeadSpec): Lead {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    companyName: spec.companyName,
    industry: spec.industry,
    city: spec.city,
    phone: spec.phone ?? "",
    email: spec.email ?? "",
    socialLink: spec.socialLink ?? "",
    googleMapsLink: spec.googleMapsLink ?? "",
    currentWebsite: spec.currentWebsite ?? "",
    demoLink: spec.demoLink ?? "",
    source: spec.source ?? "Google Maps",
    status: spec.status ?? "Nowy lead",
    priority: spec.priority ?? "Średni",
    dateAdded: spec.dateAdded ?? daysFromToday(-14),
    lastContactDate: spec.lastContactDate ?? "",
    notes: spec.notes ?? "",
    archived: spec.archived ?? false,
    createdAt: spec.createdAt ?? now,
    updatedAt: spec.updatedAt ?? now,
    placeId: spec.placeId ?? "",
    fullAddress: spec.fullAddress ?? "",
    googleCategory: spec.googleCategory ?? "",
    googleRating: spec.googleRating ?? 0,
    googleReviewsCount: spec.googleReviewsCount ?? 0,
    businessStatus: spec.businessStatus ?? "",
    openingHours: spec.openingHours ?? [],
  }
}

const DEMO_LEAD_SPECS: DemoLeadSpec[] = [
  {
    companyName: "Pizzeria Rustica",
    industry: "Pizzerie",
    city: "Tczew",
    phone: "58 123 45 67",
    email: "kontakt@rustica-tczew.pl",
    socialLink: "https://instagram.com/pizzeria.rustica",
    googleMapsLink: "https://maps.google.com/?q=Pizzeria+Rustica+Tczew",
    source: "Google Maps",
    status: "Do kontaktu",
    priority: "Wysoki",
    dateAdded: daysFromToday(-3),
    notes: "Brak własnej strony, tylko profil na Facebooku. Duży potencjał.",
    task: { title: "Zadzwonić i zaproponować spotkanie", type: "Telefon", dueDate: daysFromToday(0) },
  },
  {
    companyName: "Kawiarnia Zacisze",
    industry: "Kawiarnie",
    city: "Gdańsk",
    phone: "500 111 222",
    email: "biuro@zacisze-kawiarnia.pl",
    currentWebsite: "https://zacisze-kawiarnia.pl",
    source: "Polecenie",
    status: "Wiadomość wysłana",
    priority: "Średni",
    dateAdded: daysFromToday(-7),
    lastContactDate: daysFromToday(-2),
    notes: "Obecna strona bardzo stara, zbudowana w Wixie.",
    task: { title: "Follow-up po braku odpowiedzi", type: "Wiadomość", dueDate: daysFromToday(0) },
  },
  {
    companyName: "Salon Fryzjerski Bella",
    industry: "Salony fryzjerskie",
    city: "Gdynia",
    phone: "600 222 333",
    socialLink: "https://instagram.com/salon.bella.gdynia",
    source: "Instagram",
    status: "Czekam na odpowiedź",
    priority: "Średni",
    dateAdded: daysFromToday(-10),
    lastContactDate: daysFromToday(-4),
    task: { title: "Sprawdzić odpowiedź na e-mail", type: "E-mail", dueDate: daysFromToday(1) },
  },
  {
    companyName: "Bar Street Food Kraków",
    industry: "Bary i street food",
    city: "Kraków",
    email: "hello@streetfoodkrk.pl",
    googleMapsLink: "https://maps.google.com/?q=Street+Food+Krakow",
    source: "Cold mailing",
    status: "Zainteresowany",
    priority: "Wysoki",
    dateAdded: daysFromToday(-20),
    lastContactDate: daysFromToday(-1),
    notes: "Chcą stronę z zamówieniami online.",
    task: { title: "Wysłać wycenę", type: "Wiadomość", dueDate: daysFromToday(2) },
  },
  {
    companyName: "Fizjoterapia Ruch i Zdrowie",
    industry: "Fizjoterapia",
    city: "Tczew",
    phone: "501 987 654",
    email: "kontakt@ruchizdrowie.pl",
    currentWebsite: "https://ruchizdrowie-old.pl",
    demoLink: "https://demo.example.com/ruchizdrowie",
    source: "Cold calling",
    status: "Oferta cenowa",
    priority: "Wysoki",
    dateAdded: daysFromToday(-25),
    lastContactDate: daysFromToday(-3),
    notes: "Czekają na akceptację budżetu przez wspólnika.",
    task: { title: "Zadzwonić w sprawie decyzji", type: "Telefon", dueDate: daysFromToday(-1) },
  },
  {
    companyName: "Studio Urody Elegance",
    industry: "Beauty",
    city: "Gdańsk",
    phone: "504 456 789",
    email: "biuro@elegance-studio.pl",
    socialLink: "https://facebook.com/elegance.studio",
    source: "Facebook",
    status: "Klient",
    priority: "Niski",
    dateAdded: daysFromToday(-60),
    lastContactDate: daysFromToday(-30),
    notes: "Podpisana umowa, strona wdrożona 2026-06-15.",
  },
  {
    companyName: "Restauracja Pod Żaglami",
    industry: "Restauracje",
    city: "Gdynia",
    phone: "58 765 43 21",
    email: "info@podzaglami.pl",
    currentWebsite: "https://podzaglami.pl",
    source: "Google Maps",
    status: "Nowy lead",
    priority: "Średni",
    dateAdded: daysFromToday(-1),
    notes: "Strona istnieje, ale nie jest responsywna na telefonie.",
  },
  {
    companyName: "Językowa Akademia Kids",
    industry: "Edukacja",
    city: "Malbork",
    email: "sekretariat@akademiakids.pl",
    source: "Polecenie",
    status: "Do analizy",
    priority: "Niski",
    dateAdded: daysFromToday(-5),
  },
  {
    companyName: "Serwis AGD Fixit",
    industry: "Usługi lokalne",
    city: "Tczew",
    phone: "502 333 444",
    email: "fixit@serwis-agd.pl",
    source: "Cold calling",
    status: "Brak odpowiedzi",
    priority: "Niski",
    dateAdded: daysFromToday(-40),
    lastContactDate: daysFromToday(-35),
    notes: "Trzy próby kontaktu telefonicznego bez odzewu.",
  },
  {
    companyName: "Pizzeria Parasolka",
    industry: "Pizzerie",
    city: "Tczew",
    phone: "58 111 22 33",
    email: "zamowienia@parasolka-pizza.pl",
    currentWebsite: "https://parasolka-pizza.pl",
    demoLink: "https://demo.example.com/parasolka",
    source: "Networking",
    status: "Follow-up",
    priority: "Wysoki",
    dateAdded: daysFromToday(-12),
    lastContactDate: daysFromToday(-6),
    task: { title: "Umówić prezentację demo", type: "Demo", dueDate: daysFromToday(0) },
  },
  {
    companyName: "Bistro Hokus Pokus",
    industry: "Restauracje",
    city: "Malbork",
    phone: "509 888 777",
    email: "kontakt@hokuspokusbistro.pl",
    source: "Instagram",
    status: "Przygotowanie demo",
    priority: "Wysoki",
    dateAdded: daysFromToday(-4),
    task: { title: "Dokończyć demo strony", type: "Demo", dueDate: daysFromToday(3) },
  },
  {
    companyName: "Manufaktura Smaku",
    industry: "Restauracje",
    city: "Gdańsk",
    socialLink: "https://instagram.com/manufakturasmaku",
    source: "Instagram",
    status: "Odrzucony",
    priority: "Niski",
    dateAdded: daysFromToday(-50),
    lastContactDate: daysFromToday(-45),
    notes: "Nie są zainteresowani, mają już zamówioną stronę u kogoś innego.",
  },
]

export interface DemoData {
  leads: Lead[]
  tasks: Task[]
  activities: Activity[]
}

export function createDemoData(): DemoData {
  const leads: Lead[] = []
  const tasks: Task[] = []
  const activities: Activity[] = []

  for (const spec of DEMO_LEAD_SPECS) {
    const lead = buildLead(spec)
    leads.push(lead)
    activities.push({
      id: generateId(),
      leadId: lead.id,
      description: "Lead dodany do systemu",
      date: lead.createdAt,
    })

    if (spec.task) {
      const now = new Date().toISOString()
      tasks.push({
        id: generateId(),
        leadId: lead.id,
        title: spec.task.title,
        description: "",
        type: spec.task.type,
        priority: lead.priority,
        dueDate: spec.task.dueDate,
        status: "Do zrobienia",
        completedAt: "",
        createdAt: now,
        updatedAt: now,
        isAutomaticallyCreated: false,
      })
      activities.push({
        id: generateId(),
        leadId: lead.id,
        description: `Zaplanowano zadanie: ${spec.task.title}`,
        date: now,
      })
    }
  }

  return { leads, tasks, activities }
}

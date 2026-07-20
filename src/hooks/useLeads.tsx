import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { LeadRepository } from "@/data/repositories/LeadRepository"
import { TaskRepository } from "@/data/repositories/TaskRepository"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import type { Lead, LeadFormValues, LeadStatus } from "@/types/lead"

interface LeadsContextValue {
  leads: Lead[]
  loaded: boolean
  refresh: () => Promise<void>
  addLead: (values: LeadFormValues) => Promise<Lead>
  updateLead: (id: string, values: LeadFormValues) => Promise<void>
  changeStatus: (id: string, status: LeadStatus) => Promise<void>
  updateNotes: (id: string, notes: string) => Promise<void>
  markContacted: (id: string) => Promise<void>
  archiveLead: (id: string) => Promise<void>
  unarchiveLead: (id: string) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  findByPlaceId: (placeId: string) => Lead | undefined
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

// Supabase (w przeciwieństwie do IndexedDB + useLiveQuery) nie ma wbudowanej
// reaktywności — dlatego trzymamy leady we wspólnym Context, pobieramy raz
// przy starcie i odświeżamy po każdej mutacji, żeby każdy widok w drzewie
// komponentów widział ten sam, aktualny stan.
export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const data = await LeadRepository.getAll()
    setLeads(data)
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addLead(values: LeadFormValues): Promise<Lead> {
    const lead = await LeadRepository.add(values)
    await ActivityRepository.add(lead.id, "Lead dodany do systemu", lead.createdAt)
    await refresh()
    return lead
  }

  async function updateLead(id: string, values: LeadFormValues): Promise<void> {
    await LeadRepository.update(id, values)
    await refresh()
  }

  async function changeStatus(id: string, status: LeadStatus): Promise<void> {
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.status === status) return
    await LeadRepository.update(id, { status })
    await ActivityRepository.add(id, `Status zmieniony na "${status}"`)
    await refresh()
  }

  async function updateNotes(id: string, notes: string): Promise<void> {
    await LeadRepository.update(id, { notes })
    await refresh()
  }

  async function markContacted(id: string): Promise<void> {
    await LeadRepository.update(id, { lastContactDate: new Date().toISOString().slice(0, 10) })
    await refresh()
  }

  async function archiveLead(id: string): Promise<void> {
    await LeadRepository.update(id, { archived: true })
    await refresh()
  }

  async function unarchiveLead(id: string): Promise<void> {
    await LeadRepository.update(id, { archived: false })
    await refresh()
  }

  async function deleteLead(id: string): Promise<void> {
    await LeadRepository.delete(id)
    await TaskRepository.deleteByLead(id)
    await ActivityRepository.deleteByLead(id)
    await refresh()
  }

  function findByPlaceId(placeId: string): Lead | undefined {
    if (!placeId) return undefined
    return leads.find((lead) => lead.placeId === placeId)
  }

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loaded,
        refresh,
        addLead,
        updateLead,
        changeStatus,
        updateNotes,
        markContacted,
        archiveLead,
        unarchiveLead,
        deleteLead,
        findByPlaceId,
      }}
    >
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext)
  if (!ctx) {
    throw new Error("useLeads musi być używany wewnątrz LeadsProvider")
  }
  return ctx
}

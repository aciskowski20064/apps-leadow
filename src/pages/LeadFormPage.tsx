import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { useLeads } from "@/hooks/useLeads"
import { LeadForm } from "@/components/leads/LeadForm"
import type { LeadFormSchema } from "@/lib/validation"
import type { LeadFormValues } from "@/types/lead"

interface LeadFormPageProps {
  mode: "create" | "edit"
}

export function LeadFormPage({ mode }: LeadFormPageProps) {
  const { id } = useParams<{ id: string }>()
  const { leads, loaded, addLead, updateLead } = useLeads()
  const navigate = useNavigate()

  const existingLead = mode === "edit" ? leads.find((l) => l.id === id) : undefined

  if (mode === "edit" && !loaded) {
    return null
  }

  if (mode === "edit" && !existingLead) {
    return <Navigate to="/leady" replace />
  }

  async function handleSubmit(values: LeadFormSchema) {
    // Pola z importu Google Maps nie są edytowalne w tym formularzu —
    // przy edycji zachowujemy istniejące, przy tworzeniu ustawiamy puste.
    const fullValues: LeadFormValues = {
      ...values,
      placeId: existingLead?.placeId ?? "",
      fullAddress: existingLead?.fullAddress ?? "",
      googleCategory: existingLead?.googleCategory ?? "",
      googleRating: existingLead?.googleRating ?? 0,
      googleReviewsCount: existingLead?.googleReviewsCount ?? 0,
      businessStatus: existingLead?.businessStatus ?? "",
      openingHours: existingLead?.openingHours ?? [],
    }

    if (mode === "create") {
      const created = await addLead(fullValues)
      toast.success(`Lead "${created.companyName}" został dodany.`)
      navigate(`/leady/${created.id}`)
    } else if (existingLead) {
      await updateLead(existingLead.id, fullValues)
      toast.success("Zmiany zostały zapisane.")
      navigate(`/leady/${existingLead.id}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "create" ? "Nowy lead" : `Edytuj: ${existingLead?.companyName}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Uzupełnij dane nowej firmy, którą chcesz śledzić."
            : "Zaktualizuj dane leada."}
        </p>
      </div>
      <LeadForm
        defaultValues={existingLead}
        onSubmit={handleSubmit}
        submitLabel={mode === "create" ? "Dodaj lead" : "Zapisz zmiany"}
      />
    </div>
  )
}

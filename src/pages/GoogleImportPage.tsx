import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, MapPinned, Loader2, TriangleAlert, ExternalLink } from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useTasks } from "@/hooks/useTasks"
import { createQuickTask } from "@/data/automationService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleImportForm } from "@/components/leads/GoogleImportForm"
import { fetchGooglePlace } from "@/lib/googlePlaces"
import { todayISO } from "@/lib/dates"
import { isGoogleImportEnabled } from "@/lib/features"
import type { GoogleImportSchema } from "@/lib/validation"
import type { Lead } from "@/types/lead"
import type { GooglePlaceResult } from "@/types/googlePlaces"

type ImportState =
  | { step: "input" }
  | { step: "loading" }
  | { step: "error"; message: string }
  | { step: "duplicate"; existing: Lead }
  | { step: "preview"; place: GooglePlaceResult }

export function GoogleImportPage() {
  const { addLead, findByPlaceId } = useLeads()
  const { refresh: refreshTasks } = useTasks()
  const navigate = useNavigate()
  const [url, setUrl] = useState("")
  const [state, setState] = useState<ImportState>({ step: "input" })

  if (!isGoogleImportEnabled) {
    return <Navigate to="/leady" replace />
  }

  async function handleFetch() {
    if (!url.trim()) return
    setState({ step: "loading" })
    try {
      const place = await fetchGooglePlace(url)
      const existing = findByPlaceId(place.placeId)
      if (existing) {
        setState({ step: "duplicate", existing })
      } else {
        setState({ step: "preview", place })
      }
    } catch (err) {
      setState({
        step: "error",
        message: err instanceof Error ? err.message : "Nieznany błąd podczas pobierania danych.",
      })
    }
  }

  async function handleSave(place: GooglePlaceResult, values: GoogleImportSchema) {
    const created = await addLead({
      companyName: values.companyName,
      industry: values.industry,
      city: values.city,
      phone: values.phone,
      email: "",
      socialLink: "",
      googleMapsLink: place.googleMapsLink,
      currentWebsite: values.currentWebsite,
      demoLink: "",
      source: "Google Maps",
      status: values.status,
      priority: values.priority,
      dateAdded: todayISO(),
      lastContactDate: "",
      notes: "",
      placeId: place.placeId,
      fullAddress: place.fullAddress,
      googleCategory: place.googleCategory,
      googleRating: place.googleRating,
      googleReviewsCount: place.googleReviewsCount,
      businessStatus: place.businessStatus,
      openingHours: place.openingHours,
    })

    if (values.taskType) {
      await createQuickTask(created.id, values.taskType, values.taskDate || undefined)
      await refreshTasks()
    }

    toast.success(`Lead "${created.companyName}" został zaimportowany z Google Maps.`)
    navigate(`/leady/${created.id}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button variant="ghost" size="sm" className="w-fit" render={<Link to="/leady" />} nativeButton={false}>
          <ArrowLeft className="size-4" /> Wróć do listy
        </Button>
        <h1 className="mt-2 text-xl font-semibold text-foreground">Importuj firmę z Google Maps</h1>
        <p className="text-sm text-muted-foreground">
          Wklej link do wizytówki firmy w Google Maps, a aplikacja pobierze jej dane.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="maps-url">Link do Google Maps</Label>
            <Input
              id="maps-url"
              placeholder="https://maps.app.goo.gl/... lub https://www.google.com/maps/place/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleFetch()
                }
              }}
            />
          </div>
          <Button onClick={handleFetch} disabled={!url.trim() || state.step === "loading"}>
            {state.step === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Pobieranie…
              </>
            ) : (
              <>
                <MapPinned className="size-4" /> Pobierz dane
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {state.step === "error" && (
        <Card className="ring-destructive/30">
          <CardContent className="flex items-start gap-2.5 pt-4 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-foreground">{state.message}</p>
          </CardContent>
        </Card>
      )}

      {state.step === "duplicate" && (
        <Card>
          <CardHeader>
            <CardTitle>Ta firma już jest w Twojej bazie</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Znaleziono istniejącego leada powiązanego z tym samym miejscem w Google Maps —
              zamiast tworzyć duplikat, przejdź do jego karty.
            </p>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-foreground">{state.existing.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  {state.existing.industry} · {state.existing.city}
                </p>
              </div>
              <Button render={<Link to={`/leady/${state.existing.id}`} />} nativeButton={false}>
                Zobacz leada <ExternalLink className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.step === "preview" && (
        <GoogleImportForm
          place={state.place}
          onCancel={() => setState({ step: "input" })}
          onSubmit={(values) => handleSave(state.place, values)}
        />
      )}
    </div>
  )
}

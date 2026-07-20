import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star, MessageSquare, MapPin, Clock, Hash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { googleImportSchema, type GoogleImportSchema } from "@/lib/validation"
import { LEAD_CATEGORIES, LEAD_PRIORITIES, LEAD_STATUSES } from "@/types/lead"
import { TASK_TYPES } from "@/types/task"
import { TASK_TYPE_CONFIG } from "@/data/config"
import { isoDateFromToday, todayISO } from "@/lib/dates"
import type { GooglePlaceResult } from "@/types/googlePlaces"

interface GoogleImportFormProps {
  place: GooglePlaceResult
  onSubmit: (values: GoogleImportSchema) => void
  onCancel: () => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function GoogleImportForm({ place, onSubmit, onCancel }: GoogleImportFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoogleImportSchema>({
    resolver: zodResolver(googleImportSchema),
    defaultValues: {
      companyName: place.companyName,
      industry: place.industry,
      city: place.city,
      phone: place.phone,
      currentWebsite: place.currentWebsite,
      status: "Nowy lead",
      priority: "Średni",
      taskType: "",
      taskDate: "",
    },
  })

  const taskType = watch("taskType")

  const submit: SubmitHandler<GoogleImportSchema> = (values) => onSubmit(values)

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Dane z Google Maps</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">{place.fullAddress || "brak danych"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">
              {place.googleRating
                ? `${place.googleRating.toFixed(1)} / 5`
                : "brak danych"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">
              {place.googleReviewsCount ? `${place.googleReviewsCount} opinii` : "brak danych"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-foreground">{place.businessStatus || "brak danych"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm sm:col-span-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            {place.openingHours.length > 0 ? (
              <ul className="text-foreground">
                {place.openingHours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground">brak danych o godzinach otwarcia</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Kategoria Google: {place.googleCategory || "brak danych"} · Place ID: {place.placeId}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dane firmy (edytowalne)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">Nazwa firmy *</Label>
            <Input id="companyName" {...register("companyName")} aria-invalid={!!errors.companyName} />
            <FieldError message={errors.companyName?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industry">Branża *</Label>
            <Controller
              control={control}
              name="industry"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="industry" className="w-full" aria-invalid={!!errors.industry}>
                    <SelectValue placeholder="Wybierz branżę" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.industry?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Miasto *</Label>
            <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
            <FieldError message={errors.city?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder={place.phone ? undefined : "brak danych"}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="currentWebsite">Strona internetowa</Label>
            <Input
              id="currentWebsite"
              {...register("currentWebsite")}
              placeholder={place.currentWebsite ? undefined : "brak danych"}
              aria-invalid={!!errors.currentWebsite}
            />
            <FieldError message={errors.currentWebsite?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priorytet, status i pierwsze zadanie</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status *</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priority">Priorytet *</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taskType">Pierwsze zadanie</Label>
            <Controller
              control={control}
              name="taskType"
              render={({ field }) => (
                <Select
                  value={field.value === "" ? "brak" : field.value}
                  onValueChange={(v) => {
                    const value = v === "brak" ? "" : (v as (typeof TASK_TYPES)[number])
                    field.onChange(value)
                    if (value) {
                      setValue("taskDate", isoDateFromToday(TASK_TYPE_CONFIG[value].defaultDaysOffset))
                    } else {
                      setValue("taskDate", "")
                    }
                  }}
                >
                  <SelectTrigger id="taskType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brak">Bez zadania</SelectItem>
                    {TASK_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TASK_TYPE_CONFIG[t].defaultTaskLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taskDate">Termin pierwszego zadania</Label>
            <Input
              id="taskDate"
              type="date"
              min={todayISO()}
              disabled={!taskType}
              {...register("taskDate")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Dodaj leada
        </Button>
      </div>
    </form>
  )
}

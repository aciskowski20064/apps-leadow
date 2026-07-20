import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { leadFormSchema, type LeadFormSchema } from "@/lib/validation"
import { LEAD_CATEGORIES, LEAD_PRIORITIES, LEAD_STATUSES } from "@/types/lead"
import { LEAD_SOURCE_SUGGESTIONS } from "@/data/config"
import { todayISO } from "@/lib/dates"
import { cn } from "@/lib/utils"

interface LeadFormProps {
  defaultValues?: Partial<LeadFormSchema>
  onSubmit: (values: LeadFormSchema) => void
  submitLabel: string
}

const DEFAULT_VALUES: LeadFormSchema = {
  companyName: "",
  industry: "Inne",
  city: "",
  phone: "",
  email: "",
  socialLink: "",
  googleMapsLink: "",
  currentWebsite: "",
  demoLink: "",
  source: "",
  status: "Nowy lead",
  priority: "Średni",
  dateAdded: todayISO(),
  lastContactDate: "",
  notes: "",
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function LeadForm({ defaultValues, onSubmit, submitLabel }: LeadFormProps) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  })

  const submit: SubmitHandler<LeadFormSchema> = (values) => {
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Dane firmy</CardTitle>
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
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source">Źródło leada</Label>
            <Input id="source" list="source-suggestions" {...register("source")} />
            <datalist id="source-suggestions">
              {LEAD_SOURCE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linki</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialLink">Facebook / Instagram</Label>
            <Input id="socialLink" placeholder="https://" {...register("socialLink")} aria-invalid={!!errors.socialLink} />
            <FieldError message={errors.socialLink?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="googleMapsLink">Google Maps</Label>
            <Input id="googleMapsLink" placeholder="https://" {...register("googleMapsLink")} aria-invalid={!!errors.googleMapsLink} />
            <FieldError message={errors.googleMapsLink?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentWebsite">Obecna strona internetowa</Label>
            <Input id="currentWebsite" placeholder="https://" {...register("currentWebsite")} aria-invalid={!!errors.currentWebsite} />
            <FieldError message={errors.currentWebsite?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demoLink">Link do przygotowanego demo</Label>
            <Input id="demoLink" placeholder="https://" {...register("demoLink")} aria-invalid={!!errors.demoLink} />
            <FieldError message={errors.demoLink?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status i priorytet</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status *</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="Wybierz status" />
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
            <FieldError message={errors.status?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priority">Priorytet *</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="priority" className="w-full" aria-invalid={!!errors.priority}>
                    <SelectValue placeholder="Wybierz priorytet" />
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
            <FieldError message={errors.priority?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terminy i notatki</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateAdded">Data dodania *</Label>
            <Input id="dateAdded" type="date" {...register("dateAdded")} aria-invalid={!!errors.dateAdded} />
            <FieldError message={errors.dateAdded?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastContactDate">Data ostatniego kontaktu</Label>
            <Input id="lastContactDate" type="date" {...register("lastContactDate")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className={cn("flex justify-end gap-2")}>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

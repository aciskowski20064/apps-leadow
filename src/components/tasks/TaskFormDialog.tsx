import { useEffect, useMemo } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { taskFormSchema, type TaskFormSchema } from "@/lib/validation"
import { TASK_TYPES } from "@/types/task"
import { LEAD_PRIORITIES } from "@/types/lead"
import { useLeads } from "@/hooks/useLeads"
import { todayISO } from "@/lib/dates"
import type { Task } from "@/types/task"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  defaultLeadId?: string
  onSubmit: (values: TaskFormSchema) => void
}

const NO_LEAD = "brak"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultLeadId,
  onSubmit,
}: TaskFormDialogProps) {
  const { leads } = useLeads()
  const leadsById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Inne",
      priority: "Średni",
      dueDate: todayISO(),
      leadId: defaultLeadId ?? "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        dueDate: task.dueDate,
        leadId: task.leadId ?? "",
      })
    } else {
      reset({
        title: "",
        description: "",
        type: "Inne",
        priority: "Średni",
        dueDate: todayISO(),
        leadId: defaultLeadId ?? "",
      })
    }
  }, [open, task, defaultLeadId, reset])

  const submit: SubmitHandler<TaskFormSchema> = (values) => onSubmit(values)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{task ? "Edytuj zadanie" : "Nowe zadanie"}</DialogTitle>
            <DialogDescription>
              {task ? "Zaktualizuj szczegóły zadania." : "Utwórz nowe zadanie, opcjonalnie powiązane z leadem."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Tytuł *</Label>
            <Input id="task-title" {...register("title")} aria-invalid={!!errors.title} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Opis</Label>
            <Textarea id="task-description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-type">Typ</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priorytet</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-priority" className="w-full">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due-date">Termin</Label>
            <Input id="task-due-date" type="date" {...register("dueDate")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-lead">Powiązany lead</Label>
            <Controller
              control={control}
              name="leadId"
              render={({ field }) => (
                <Select
                  value={field.value === "" ? NO_LEAD : field.value}
                  onValueChange={(v) => field.onChange(v === NO_LEAD ? "" : v)}
                >
                  <SelectTrigger id="task-lead" className="w-full">
                    <SelectValue>
                      {(value: string | null) =>
                        !value || value === NO_LEAD
                          ? "Bez leada"
                          : (leadsById.get(value)?.companyName ?? "Bez leada")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEAD}>Bez leada</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {task ? "Zapisz zmiany" : "Dodaj zadanie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

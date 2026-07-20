import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Phone,
  Mail,
  Share2,
  MapPin,
  Globe,
  MonitorPlay,
  Building2,
  Plus,
  Star,
  MessageSquare,
  Clock,
  Hash,
} from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useTasks } from "@/hooks/useTasks"
import { useActivities } from "@/hooks/useActivities"
import { performQuickAction, createQuickTask } from "@/data/automationService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/leads/StatusBadge"
import { PriorityBadge } from "@/components/leads/PriorityBadge"
import { ContactHistoryList } from "@/components/leads/ContactHistoryList"
import { QuickActionsPanel } from "@/components/leads/QuickActionsPanel"
import { TaskRow } from "@/components/tasks/TaskRow"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { formatDate } from "@/lib/dates"
import { sortByDueDate } from "@/lib/taskViews"
import { cn, normalizeUrl } from "@/lib/utils"
import { LEAD_STATUSES, type LeadStatus } from "@/types/lead"
import { TASK_TYPES } from "@/types/task"
import type { Task } from "@/types/task"
import type { TaskFormSchema } from "@/lib/validation"

function LinkRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words text-sm font-medium text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="break-words text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  )
}

export function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    leads,
    loaded,
    changeStatus,
    updateNotes,
    archiveLead,
    unarchiveLead,
    deleteLead,
    refresh: refreshLeads,
  } = useLeads()

  const lead = leads.find((l) => l.id === id)

  const {
    tasks,
    addTask,
    updateTask,
    completeTask,
    reopenTask,
    rescheduleTask,
    postponeToTomorrow,
    deleteTask,
    refresh: refreshTasks,
  } = useTasks()
  const { activities, addActivity, refresh: refreshActivities } = useActivities(id ?? "")

  const [notes, setNotes] = useState(lead?.notes ?? "")
  const [historyEntry, setHistoryEntry] = useState("")
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null)

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes)
    }
  }, [lead?.id])

  if (!loaded) {
    return null
  }

  if (!lead) {
    return <Navigate to="/leady" replace />
  }

  const notesChanged = notes !== lead.notes
  const leadTasks = sortByDueDate(tasks.filter((t) => t.leadId === lead.id))

  async function handleDelete() {
    await deleteLead(lead!.id)
    toast.success(`Lead "${lead!.companyName}" został usunięty.`)
    navigate("/leady")
  }

  async function handleToggleTaskDone(task: Task) {
    if (task.status === "Wykonane") {
      await reopenTask(task.id)
    } else {
      await completeTask(task.id)
      toast.success("Zadanie oznaczone jako wykonane.")
    }
    await refreshActivities()
  }

  async function handleTaskFormSubmit(values: TaskFormSchema) {
    const payload = {
      leadId: values.leadId || lead!.id,
      title: values.title,
      description: values.description,
      type: values.type,
      priority: values.priority,
      dueDate: values.dueDate,
    }
    if (editingTask) {
      await updateTask(editingTask.id, payload)
      toast.success("Zadanie zaktualizowane.")
    } else {
      await addTask(payload)
      toast.success("Zadanie dodane.")
    }
    await refreshActivities()
    setTaskFormOpen(false)
  }

  async function handleDeleteTaskConfirm() {
    if (!pendingDeleteTask) return
    await deleteTask(pendingDeleteTask.id)
    toast.success("Zadanie usunięte.")
    setPendingDeleteTask(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link to="/leady" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" /> Wróć do listy
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{lead.companyName}</h1>
              {lead.archived && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Zarchiwizowany
                </span>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-3.5" /> {lead.industry} · {lead.city}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link to={`/leady/${lead.id}/edytuj`} />} nativeButton={false}>
              <Pencil className="size-4" /> Edytuj
            </Button>
            {lead.archived ? (
              <Button
                variant="outline"
                onClick={() => {
                  unarchiveLead(lead.id)
                  toast.success("Lead przywrócony z archiwum.")
                }}
              >
                <ArchiveRestore className="size-4" /> Przywróć
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  archiveLead(lead.id)
                  toast.success("Lead zarchiwizowany.")
                }}
              >
                <Archive className="size-4" /> Archiwizuj
              </Button>
            )}
            <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="size-4" /> Usuń
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {lead.placeId && (
            <Card>
              <CardHeader>
                <CardTitle>Dane z Google Maps</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{lead.fullAddress || "brak danych"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {lead.googleRating ? `${lead.googleRating.toFixed(1)} / 5` : "brak danych"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {lead.googleReviewsCount ? `${lead.googleReviewsCount} opinii` : "brak danych"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">
                    {lead.businessStatus || "brak danych"}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm sm:col-span-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {lead.openingHours.length > 0 ? (
                    <ul className="text-foreground">
                      {lead.openingHours.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">brak danych o godzinach otwarcia</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Kategoria Google: {lead.googleCategory || "brak danych"} · Place ID: {lead.placeId}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe i linki</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LinkRow icon={Phone} label="Telefon" value={lead.phone} href={lead.phone ? `tel:${lead.phone.replace(/\s+/g, "")}` : undefined} />
              <LinkRow icon={Mail} label="E-mail" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
              <LinkRow icon={Share2} label="Facebook / Instagram" value={lead.socialLink} href={lead.socialLink ? normalizeUrl(lead.socialLink) : undefined} />
              <LinkRow icon={MapPin} label="Google Maps" value={lead.googleMapsLink} href={lead.googleMapsLink ? normalizeUrl(lead.googleMapsLink) : undefined} />
              <LinkRow icon={Globe} label="Obecna strona" value={lead.currentWebsite} href={lead.currentWebsite ? normalizeUrl(lead.currentWebsite) : undefined} />
              <LinkRow icon={MonitorPlay} label="Demo" value={lead.demoLink} href={lead.demoLink ? normalizeUrl(lead.demoLink) : undefined} />
              {!lead.phone &&
                !lead.email &&
                !lead.socialLink &&
                !lead.googleMapsLink &&
                !lead.currentWebsite &&
                !lead.demoLink && (
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    Brak uzupełnionych danych kontaktowych.
                  </p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notatki</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodaj notatkę o leadzie…"
              />
              <Button
                size="sm"
                className="w-fit"
                disabled={!notesChanged}
                onClick={() => {
                  updateNotes(lead.id, notes)
                  toast.success("Notatki zapisane.")
                }}
              >
                Zapisz notatki
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historia kontaktów</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="np. Rozmowa telefoniczna, umówiono spotkanie"
                  value={historyEntry}
                  onChange={(e) => setHistoryEntry(e.target.value)}
                />
                <Button
                  className="shrink-0"
                  disabled={!historyEntry.trim()}
                  onClick={async () => {
                    await addActivity(historyEntry.trim())
                    setHistoryEntry("")
                    toast.success("Dodano wpis do historii kontaktów.")
                  }}
                >
                  <Plus className="size-4" /> Dodaj wpis
                </Button>
              </div>
              <ContactHistoryList entries={activities} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActionsPanel
                onAction={async (actionKey) => {
                  await performQuickAction(lead.id, actionKey)
                  await Promise.all([refreshLeads(), refreshTasks(), refreshActivities()])
                  toast.success("Akcja wykonana — status i zadania zaktualizowane.")
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zmiana statusu</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={lead.status}
                onValueChange={async (value) => {
                  await changeStatus(lead.id, value as LeadStatus)
                  await refreshActivities()
                  toast.success(`Status zmieniony na „${value}”.`)
                }}
              >
                <SelectTrigger className="w-full">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zadania</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {TASK_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await createQuickTask(lead.id, type)
                      await Promise.all([refreshTasks(), refreshActivities()])
                      toast.success(`Zaplanowano zadanie (${type}).`)
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {leadTasks.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">Brak zadań dla tego leada.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {leadTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggleDone={handleToggleTaskDone}
                      onReschedule={rescheduleTask}
                      onPostponeTomorrow={postponeToTomorrow}
                      onEdit={(t) => {
                        setEditingTask(t)
                        setTaskFormOpen(true)
                      }}
                      onDelete={setPendingDeleteTask}
                    />
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => {
                  setEditingTask(null)
                  setTaskFormOpen(true)
                }}
              >
                <Plus className="size-4" /> Dodaj zadanie
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacje dodatkowe</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data dodania</span>
                <span className="font-medium text-foreground">{formatDate(lead.dateAdded)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ostatni kontakt</span>
                <span className="font-medium text-foreground">
                  {formatDate(lead.lastContactDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Źródło leada</span>
                <span className={cn("font-medium text-foreground", !lead.source && "text-muted-foreground")}>
                  {lead.source || "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć tego leada?</AlertDialogTitle>
            <AlertDialogDescription>
              Lead „{lead.companyName}” zostanie trwale usunięty wraz z całą historią kontaktów i
              powiązanymi zadaniami. Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Usuń leada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskFormDialog
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={editingTask}
        defaultLeadId={lead.id}
        onSubmit={handleTaskFormSubmit}
      />

      <AlertDialog
        open={pendingDeleteTask !== null}
        onOpenChange={(open) => !open && setPendingDeleteTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć to zadanie?</AlertDialogTitle>
            <AlertDialogDescription>
              Zadanie „{pendingDeleteTask?.title}” zostanie trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteTaskConfirm}
            >
              Usuń zadanie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

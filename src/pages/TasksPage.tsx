import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useLeads } from "@/hooks/useLeads"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { TaskRow } from "@/components/tasks/TaskRow"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { TASK_VIEWS, TASK_VIEW_LABELS, filterTasksByView, sortByDueDate, type TaskView } from "@/lib/taskViews"
import type { Task } from "@/types/task"
import type { TaskFormSchema } from "@/lib/validation"

export function TasksPage() {
  const { tasks, addTask, updateTask, completeTask, reopenTask, rescheduleTask, postponeToTomorrow, deleteTask } =
    useTasks()
  const { leads } = useLeads()
  const leadsById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])

  const [view, setView] = useState<TaskView>("dzisiaj")
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)

  const visibleTasks = useMemo(
    () => sortByDueDate(filterTasksByView(tasks, view)),
    [tasks, view]
  )

  function openCreateDialog() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: TaskFormSchema) {
    const payload = {
      leadId: values.leadId || undefined,
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
    setFormOpen(false)
  }

  async function handleToggleDone(task: Task) {
    if (task.status === "Wykonane") {
      await reopenTask(task.id)
    } else {
      await completeTask(task.id)
      toast.success("Zadanie oznaczone jako wykonane.")
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return
    await deleteTask(pendingDelete.id)
    toast.success("Zadanie usunięte.")
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Zadania</h1>
          <p className="text-sm text-muted-foreground">
            {visibleTasks.length} {visibleTasks.length === 1 ? "zadanie" : "zadań"} w widoku „
            {TASK_VIEW_LABELS[view]}”
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" /> Dodaj zadanie
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as TaskView)}>
        <TabsList className="flex-wrap">
          {TASK_VIEWS.map((v) => (
            <TabsTrigger key={v} value={v}>
              {TASK_VIEW_LABELS[v]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2">
        {visibleTasks.length === 0 ? (
          <div className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
            Brak zadań w tym widoku.
          </div>
        ) : (
          visibleTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              lead={task.leadId ? leadsById.get(task.leadId) : undefined}
              onToggleDone={handleToggleDone}
              onReschedule={rescheduleTask}
              onPostponeTomorrow={postponeToTomorrow}
              onEdit={openEditDialog}
              onDelete={setPendingDelete}
            />
          ))
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć to zadanie?</AlertDialogTitle>
            <AlertDialogDescription>
              Zadanie „{pendingDelete?.title}” zostanie trwale usunięte. Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Usuń zadanie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

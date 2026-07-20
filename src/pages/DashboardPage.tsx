import { useMemo } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Users,
  PhoneCall,
  Clock,
  Sparkles,
  FileText,
  Trophy,
  ArrowRight,
  CalendarClock,
  AlertTriangle,
  UserX,
} from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useTasks } from "@/hooks/useTasks"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatusBadge } from "@/components/leads/StatusBadge"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, isDateOverdue, isDateToday } from "@/lib/dates"
import { sortByDueDate } from "@/lib/taskViews"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"

export function DashboardPage() {
  const { leads } = useLeads()
  const { tasks, completeTask } = useTasks()

  const activeLeads = useMemo(() => leads.filter((l) => !l.archived), [leads])
  const leadsById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])
  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "Do zrobienia"), [tasks])

  const overdueTasks = useMemo(
    () => sortByDueDate(activeTasks.filter((t) => isDateOverdue(t.dueDate))),
    [activeTasks]
  )
  const todayTasks = useMemo(
    () => sortByDueDate(activeTasks.filter((t) => isDateToday(t.dueDate))),
    [activeTasks]
  )
  const priorityTasks = useMemo(
    () => [...overdueTasks, ...todayTasks].slice(0, 8),
    [overdueTasks, todayTasks]
  )

  const leadsNeedingTask = useMemo(() => {
    const leadsWithActiveTask = new Set(activeTasks.map((t) => t.leadId).filter(Boolean))
    return activeLeads
      .filter(
        (l) =>
          !leadsWithActiveTask.has(l.id) && l.status !== "Klient" && l.status !== "Odrzucony"
      )
      .slice(0, 6)
  }, [activeLeads, activeTasks])

  const stats = useMemo(() => {
    const dueLeadIds = new Set(
      [...overdueTasks, ...todayTasks].map((t) => t.leadId).filter(Boolean)
    )
    return {
      total: activeLeads.length,
      dueToday: dueLeadIds.size,
      waiting: activeLeads.filter((l) => l.status === "Czekam na odpowiedź").length,
      interested: activeLeads.filter((l) => l.status === "Zainteresowany").length,
      offersSent: activeLeads.filter((l) => l.status === "Oferta cenowa").length,
      clients: activeLeads.filter((l) => l.status === "Klient").length,
    }
  }, [activeLeads, overdueTasks, todayTasks])

  const recentLeads = useMemo(() => {
    return [...activeLeads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  }, [activeLeads])

  async function handleQuickComplete(task: Task) {
    await completeTask(task.id)
    toast.success("Zadanie oznaczone jako wykonane.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Szybki przegląd leadów i zadań wymagających Twojej uwagi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Wszystkie leady" value={stats.total} icon={Users} to="/leady" />
        <StatCard
          label="Do kontaktu dzisiaj"
          value={stats.dueToday}
          icon={PhoneCall}
          to="/zadania"
          accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Oczekujące na odpowiedź"
          value={stats.waiting}
          icon={Clock}
          to="/leady?status=Czekam+na+odpowiedź"
          accentClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
        <StatCard
          label="Zainteresowani"
          value={stats.interested}
          icon={Sparkles}
          to="/leady?status=Zainteresowany"
          accentClassName="bg-teal-500/10 text-teal-600 dark:text-teal-400"
        />
        <StatCard
          label="Wysłane oferty"
          value={stats.offersSent}
          icon={FileText}
          to="/leady?status=Oferta+cenowa"
          accentClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Pozyskani klienci"
          value={stats.clients}
          icon={Trophy}
          to="/leady?status=Klient"
          accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4 text-muted-foreground" />
                Zaległe i dzisiejsze zadania
              </CardTitle>
              <Button variant="ghost" size="sm" render={<Link to="/zadania" />} nativeButton={false}>
                Zobacz wszystkie <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {priorityTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Brak zaległych i dzisiejszych zadań. Świetna robota!
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {priorityTasks.map((task) => {
                  const lead = task.leadId ? leadsById.get(task.leadId) : undefined
                  const overdue = isDateOverdue(task.dueDate)
                  return (
                    <li key={task.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                      <Checkbox
                        className="mt-0.5"
                        checked={false}
                        onCheckedChange={() => handleQuickComplete(task)}
                        aria-label="Oznacz jako wykonane"
                      />
                      <Link
                        to={lead ? `/leady/${lead.id}` : "/zadania"}
                        className="flex flex-1 items-center justify-between gap-3 hover:opacity-80"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lead ? lead.companyName : "Zadanie bez leada"}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              overdue && "text-red-600 dark:text-red-400",
                              !overdue && "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {overdue ? "Zaległe" : "Dzisiaj"} · {formatDate(task.dueDate)}
                          </span>
                          <Badge variant="secondary">{task.type}</Badge>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                Ostatnio dodane leady
              </CardTitle>
              <Button variant="ghost" size="sm" render={<Link to="/leady" />} nativeButton={false}>
                Zobacz wszystkie <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nie dodano jeszcze żadnych leadów.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/leady/${lead.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {lead.companyName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lead.industry} · {lead.city}
                        </p>
                      </div>
                      <StatusBadge status={lead.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-muted-foreground" />
              Leady bez aktywnego zadania
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsNeedingTask.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Każdy aktywny lead ma zaplanowane zadanie.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {leadsNeedingTask.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/leady/${lead.id}`}
                      className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 hover:bg-muted/50"
                    >
                      <UserX className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {lead.companyName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lead.industry} · {lead.city}
                        </p>
                      </div>
                      <StatusBadge status={lead.status} className="ml-auto shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Plus, Search, ArrowUpDown, ExternalLink, MapPinned } from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useTasks } from "@/hooks/useTasks"
import { isGoogleImportEnabled } from "@/lib/features"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { LeadActionsMenu } from "@/components/leads/LeadActionsMenu"
import { formatDate, isDateOverdue, isDateToday } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { LEAD_CATEGORIES, LEAD_PRIORITIES, LEAD_STATUSES, type Lead } from "@/types/lead"
import { toast } from "sonner"

export function LeadsListPage() {
  const { leads, archiveLead, unarchiveLead, deleteLead } = useLeads()
  const { tasks } = useTasks()
  const [searchParams, setSearchParams] = useSearchParams()

  // Termin najbliższego aktywnego zadania per lead (zastępuje dawne lead.nextActionDate).
  const nextTaskDateByLead = useMemo(() => {
    const map = new Map<string, string>()
    for (const task of tasks) {
      if (task.status !== "Do zrobienia" || !task.leadId || !task.dueDate) continue
      const current = map.get(task.leadId)
      if (!current || task.dueDate < current) {
        map.set(task.leadId, task.dueDate)
      }
    }
    return map
  }, [tasks])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dueTodayOnly, setDueTodayOnly] = useState(false)
  const [tab, setTab] = useState<"active" | "archived">("active")
  const [sortAsc, setSortAsc] = useState(true)
  const [leadPendingDelete, setLeadPendingDelete] = useState<Lead | null>(null)

  useEffect(() => {
    const status = searchParams.get("status")
    if (status) setStatusFilter(status)
    if (searchParams.get("due") === "today") setDueTodayOnly(true)
  }, [searchParams])

  const cities = useMemo(
    () => Array.from(new Set(leads.map((l) => l.city).filter(Boolean))).sort(),
    [leads]
  )

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()
    let result = leads.filter((lead) => lead.archived === (tab === "archived"))

    if (query) {
      result = result.filter((lead) =>
        [lead.companyName, lead.city, lead.email, lead.phone, lead.industry]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter)
    }
    if (industryFilter !== "all") {
      result = result.filter((lead) => lead.industry === industryFilter)
    }
    if (cityFilter !== "all") {
      result = result.filter((lead) => lead.city === cityFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter((lead) => lead.priority === priorityFilter)
    }
    if (dueTodayOnly) {
      result = result.filter((lead) => {
        const dueDate = nextTaskDateByLead.get(lead.id)
        return dueDate && (isDateToday(dueDate) || isDateOverdue(dueDate))
      })
    }

    result = [...result].sort((a, b) => {
      const aDate = nextTaskDateByLead.get(a.id) || (sortAsc ? "9999-99-99" : "")
      const bDate = nextTaskDateByLead.get(b.id) || (sortAsc ? "9999-99-99" : "")
      return sortAsc ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    })

    return result
  }, [
    leads,
    tab,
    search,
    statusFilter,
    industryFilter,
    cityFilter,
    priorityFilter,
    dueTodayOnly,
    sortAsc,
    nextTaskDateByLead,
  ])

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setIndustryFilter("all")
    setCityFilter("all")
    setPriorityFilter("all")
    setDueTodayOnly(false)
    setSearchParams({})
  }

  function handleConfirmDelete() {
    if (!leadPendingDelete) return
    deleteLead(leadPendingDelete.id)
    toast.success(`Lead "${leadPendingDelete.companyName}" został usunięty.`)
    setLeadPendingDelete(null)
  }

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    industryFilter !== "all" ||
    cityFilter !== "all" ||
    priorityFilter !== "all" ||
    dueTodayOnly

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Wszystkie leady</h1>
          <p className="text-sm text-muted-foreground">
            {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leadów"}
            {tab === "archived" ? " w archiwum" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {isGoogleImportEnabled && (
            <Button
              variant="outline"
              render={<Link to="/leady/z-google-maps" />}
              nativeButton={false}
            >
              <MapPinned className="size-4" /> Z Google Maps
            </Button>
          )}
          <Button render={<Link to="/leady/nowy" />} nativeButton={false}>
            <Plus className="size-4" /> Dodaj lead
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
        <TabsList>
          <TabsTrigger value="active">Aktywne</TabsTrigger>
          <TabsTrigger value="archived">Zarchiwizowane</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj po nazwie, mieście, e-mailu, telefonie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="min-w-40 flex-1 sm:flex-none">
              <SelectValue placeholder="Status">
                {(value: string | null) => (!value || value === "all" ? "Wszystkie statusy" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v ?? "all")}>
            <SelectTrigger className="min-w-40 flex-1 sm:flex-none">
              <SelectValue placeholder="Branża">
                {(value: string | null) => (!value || value === "all" ? "Wszystkie branże" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie branże</SelectItem>
              {LEAD_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={(v) => setCityFilter(v ?? "all")}>
            <SelectTrigger className="min-w-36 flex-1 sm:flex-none">
              <SelectValue placeholder="Miasto">
                {(value: string | null) => (!value || value === "all" ? "Wszystkie miasta" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie miasta</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="min-w-36 flex-1 sm:flex-none">
              <SelectValue placeholder="Priorytet">
                {(value: string | null) => (!value || value === "all" ? "Wszystkie priorytety" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie priorytety</SelectItem>
              {LEAD_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={dueTodayOnly ? "default" : "outline"}
            onClick={() => setDueTodayOnly((v) => !v)}
          >
            Do kontaktu dziś
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Branża</TableHead>
              <TableHead>Miasto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priorytet</TableHead>
              <TableHead>
                <button
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Termin działania <ArrowUpDown className="size-3.5" />
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Brak leadów spełniających kryteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const nextTaskDate = nextTaskDateByLead.get(lead.id)
                return (
                <TableRow key={lead.id} className="group">
                  <TableCell>
                    <Link
                      to={`/leady/${lead.id}`}
                      className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
                    >
                      {lead.companyName}
                      <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.industry}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.city}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={lead.priority} />
                  </TableCell>
                  <TableCell>
                    {nextTaskDate ? (
                      <span
                        className={cn(
                          isDateOverdue(nextTaskDate) &&
                            "font-medium text-red-600 dark:text-red-400",
                          isDateToday(nextTaskDate) &&
                            "font-medium text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {formatDate(nextTaskDate)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <LeadActionsMenu
                      lead={lead}
                      onArchive={(id) => {
                        archiveLead(id)
                        toast.success("Lead zarchiwizowany.")
                      }}
                      onUnarchive={(id) => {
                        unarchiveLead(id)
                        toast.success("Lead przywrócony z archiwum.")
                      }}
                      onRequestDelete={setLeadPendingDelete}
                    />
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={leadPendingDelete !== null}
        onOpenChange={(open) => !open && setLeadPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć tego leada?</AlertDialogTitle>
            <AlertDialogDescription>
              Lead „{leadPendingDelete?.companyName}” zostanie trwale usunięty wraz z całą
              historią kontaktów. Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Usuń leada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

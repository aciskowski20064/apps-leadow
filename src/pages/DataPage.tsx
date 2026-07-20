import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Upload, Sparkles, Trash2, FileJson, FileSpreadsheet, CloudUpload } from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useTasks } from "@/hooks/useTasks"
import {
  getLocalIndexedDbData,
  hasLocalIndexedDbData,
  migrateLocalDataToSupabase,
  clearLocalIndexedDbData,
} from "@/data/migrateToSupabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  exportAllDataToJson,
  exportLeadsToCsv,
  parseImportedData,
  readFileAsText,
} from "@/lib/importExport"
import { getAllData, replaceAllData, loadDemoData, clearAllData, type FullDataset } from "@/data/dataService"

type PendingAction =
  | { type: "import"; data: FullDataset }
  | { type: "demo" }
  | { type: "clear" }
  | null

export function DataPage() {
  const { leads, refresh: refreshLeads } = useLeads()
  const { tasks, refresh: refreshTasks } = useTasks()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const [localData, setLocalData] = useState<FullDataset | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [migrated, setMigrated] = useState(false)
  const [confirmClearLocalOpen, setConfirmClearLocalOpen] = useState(false)

  useEffect(() => {
    hasLocalIndexedDbData().then(async (has) => {
      if (has) setLocalData(await getLocalIndexedDbData())
    })
  }, [])

  async function handleMigrateToSupabase() {
    if (!localData) return
    setMigrating(true)
    try {
      await migrateLocalDataToSupabase(localData)
      await Promise.all([refreshLeads(), refreshTasks()])
      setMigrated(true)
      toast.success(
        `Zmigrowano ${localData.leads.length} leadów i ${localData.tasks.length} zadań do Supabase. Pobrano też kopię zapasową JSON na wszelki wypadek.`
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Migracja do Supabase nie powiodła się.")
    } finally {
      setMigrating(false)
    }
  }

  async function handleClearLocalData() {
    await clearLocalIndexedDbData()
    setLocalData(null)
    setConfirmClearLocalOpen(false)
    toast.success("Dane lokalne (IndexedDB) w tej przeglądarce zostały wyczyszczone.")
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const data = parseImportedData(text)
      setPendingAction({ type: "import", data })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się wczytać pliku.")
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return
    if (pendingAction.type === "import") {
      await replaceAllData(pendingAction.data)
      toast.success(`Zaimportowano ${pendingAction.data.leads.length} leadów i ${pendingAction.data.tasks.length} zadań.`)
    } else if (pendingAction.type === "demo") {
      await loadDemoData()
      toast.success("Załadowano dane demonstracyjne.")
    } else if (pendingAction.type === "clear") {
      await clearAllData()
      toast.success("Usunięto wszystkie dane.")
    }
    await Promise.all([refreshLeads(), refreshTasks()])
    setPendingAction(null)
  }

  async function handleExportJson() {
    const data = await getAllData()
    exportAllDataToJson(data)
  }

  const dialogText: Record<NonNullable<PendingAction>["type"], { title: string; description: string; confirmLabel: string }> = {
    import: {
      title: "Zaimportować dane?",
      description: `Ta operacja zastąpi obecne ${leads.length} leadów i ${tasks.length} zadań zawartością pliku (${
        pendingAction?.type === "import" ? pendingAction.data.leads.length : 0
      } leadów, ${pendingAction?.type === "import" ? pendingAction.data.tasks.length : 0} zadań). Tej operacji nie można cofnąć.`,
      confirmLabel: "Importuj i zastąp",
    },
    demo: {
      title: "Załadować dane demonstracyjne?",
      description: `Obecne ${leads.length} leadów i ${tasks.length} zadań zostanie zastąpionych przykładowymi danymi. Tej operacji nie można cofnąć.`,
      confirmLabel: "Załaduj dane demo",
    },
    clear: {
      title: "Usunąć wszystkie dane?",
      description: `Wszystkie ${leads.length} leadów, ${tasks.length} zadań i cała historia aktywności zostaną trwale usunięte. Tej operacji nie można cofnąć.`,
      confirmLabel: "Usuń wszystko",
    },
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dane</h1>
        <p className="text-sm text-muted-foreground">
          Dane są przechowywane w Supabase i synchronizowane między urządzeniami. Eksport, import i
          zarządzanie danymi konta poniżej.
        </p>
      </div>

      {localData && (
        <Card>
          <CardHeader>
            <CardTitle>Migracja danych lokalnych do Supabase</CardTitle>
            <CardDescription>
              Wykryto {localData.leads.length} leadów i {localData.tasks.length} zadań zapisanych
              lokalnie w tej przeglądarce (sprzed przejścia na Supabase). Migracja najpierw pobierze
              kopię zapasową JSON, a potem wgra te dane do Twojego konta.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={handleMigrateToSupabase} disabled={migrating || migrated}>
              <CloudUpload className="size-4" />
              {migrated ? "Zmigrowano" : migrating ? "Migruję…" : "Pobierz kopię i migruj do Supabase"}
            </Button>
            {migrated && (
              <Button variant="outline" onClick={() => setConfirmClearLocalOpen(true)}>
                <Trash2 className="size-4" /> Wyczyść dane lokalne
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Eksport danych</CardTitle>
          <CardDescription>
            Pobierz kopię wszystkich {leads.length} leadów i {tasks.length} zadań.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportJson}>
            <FileJson className="size-4" /> Eksportuj do JSON
          </Button>
          <Button variant="outline" onClick={() => exportLeadsToCsv(leads)}>
            <FileSpreadsheet className="size-4" /> Eksportuj leady do CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import danych</CardTitle>
          <CardDescription>
            Wczytaj plik JSON wyeksportowany wcześniej z tej aplikacji (leady, zadania i historia
            aktywności). Import zastąpi obecne dane.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" /> Importuj z pliku JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dane demonstracyjne</CardTitle>
          <CardDescription>
            Załaduj przykładowe leady i zadania, aby zobaczyć jak działa aplikacja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setPendingAction({ type: "demo" })}>
            <Sparkles className="size-4" /> Załaduj dane demonstracyjne
          </Button>
        </CardContent>
      </Card>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Strefa zagrożenia</CardTitle>
          <CardDescription>Trwałe usunięcie wszystkich danych z tej przeglądarki.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setPendingAction({ type: "clear" })}>
            <Trash2 className="size-4" /> Usuń wszystkie dane
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          {pendingAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{dialogText[pendingAction.type].title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {dialogText[pendingAction.type].description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={confirmPendingAction}
                >
                  {dialogText[pendingAction.type].confirmLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClearLocalOpen} onOpenChange={setConfirmClearLocalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wyczyścić dane lokalne?</AlertDialogTitle>
            <AlertDialogDescription>
              Dane w Supabase pozostaną nietknięte — usunięta zostanie tylko lokalna kopia w
              IndexedDB tej przeglądarki. Rób to dopiero po sprawdzeniu, że migracja się powiodła.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleClearLocalData}
            >
              Wyczyść dane lokalne
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

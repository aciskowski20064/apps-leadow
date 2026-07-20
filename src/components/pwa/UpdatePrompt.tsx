import { useRegisterSW } from "virtual:pwa-register/react"
import { RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // Sprawdzaj co godzinę, czy jest nowsza wersja (bez wymuszania odświeżenia).
      setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  function close() {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
      <p className="flex-1">
        {needRefresh
          ? "Dostępna jest nowa wersja aplikacji."
          : "Aplikacja jest gotowa do pracy offline."}
      </p>
      {needRefresh && (
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          <RefreshCw className="size-3.5" /> Odśwież
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Zamknij">
        <X className="size-4" />
      </Button>
    </div>
  )
}

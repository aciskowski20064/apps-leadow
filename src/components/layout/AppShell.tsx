import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/SidebarNav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="" className="size-7 rounded-lg" />
            <span className="text-sm font-semibold">Leadow CRM</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Otwórz menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu nawigacji</SheetTitle>
                <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

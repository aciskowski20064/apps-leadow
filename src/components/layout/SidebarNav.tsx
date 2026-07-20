import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Database, Plus, MapPinned, ListChecks, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { InstallButton } from "@/components/pwa/InstallButton"
import { useAuth } from "@/hooks/useAuth"
import { isGoogleImportEnabled } from "@/lib/features"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leady", label: "Wszystkie leady", icon: Users, end: false },
  { to: "/zadania", label: "Zadania", icon: ListChecks, end: false },
  { to: "/dane", label: "Dane", icon: Database, end: true },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 px-1 py-1">
        <img src="/logo-mark.png" alt="" className="size-8 rounded-lg" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Leadow CRM</span>
          <span className="text-xs text-muted-foreground">Panel leadów</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          render={<NavLink to="/leady/nowy" onClick={onNavigate} />}
          nativeButton={false}
          className="w-full justify-center"
        >
          <Plus className="size-4" />
          Dodaj lead
        </Button>
        {isGoogleImportEnabled && (
          <Button
            variant="outline"
            render={<NavLink to="/leady/z-google-maps" onClick={onNavigate} />}
            nativeButton={false}
            className="w-full justify-center"
          >
            <MapPinned className="size-4" />
            Z Google Maps
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground"
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <InstallButton />
        {user && (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground" title={user.email ?? ""}>
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              aria-label="Wyloguj się"
              title="Wyloguj się"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Motyw</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

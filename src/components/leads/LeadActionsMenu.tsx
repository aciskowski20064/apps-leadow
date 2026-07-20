import { Link } from "react-router-dom"
import { MoreHorizontal, Eye, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Lead } from "@/types/lead"

interface LeadActionsMenuProps {
  lead: Lead
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onRequestDelete: (lead: Lead) => void
}

export function LeadActionsMenu({
  lead,
  onArchive,
  onUnarchive,
  onRequestDelete,
}: LeadActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Akcje" />}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link to={`/leady/${lead.id}`} />}>
          <Eye className="size-4" /> Podgląd
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`/leady/${lead.id}/edytuj`} />}>
          <Pencil className="size-4" /> Edytuj
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {lead.archived ? (
          <DropdownMenuItem onClick={() => onUnarchive(lead.id)}>
            <ArchiveRestore className="size-4" /> Przywróć z archiwum
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onArchive(lead.id)}>
            <Archive className="size-4" /> Archiwizuj
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={() => onRequestDelete(lead)}>
          <Trash2 className="size-4" /> Usuń
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

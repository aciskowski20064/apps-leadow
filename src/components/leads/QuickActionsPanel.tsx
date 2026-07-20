import { Button } from "@/components/ui/button"
import { QUICK_ACTIONS } from "@/data/config"

export function QuickActionsPanel({ onAction }: { onAction: (actionKey: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.key}
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={() => onAction(action.key)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

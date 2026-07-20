import { LeadRepository } from "@/data/repositories/LeadRepository"
import { TaskRepository } from "@/data/repositories/TaskRepository"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import { QUICK_ACTIONS, TASK_TYPE_CONFIG } from "@/data/config"
import { isoDateFromToday } from "@/lib/dates"
import type { TaskType } from "@/types/task"

/**
 * Wykonuje "szybką akcję" z karty leada: zmienia status, zamyka wszystkie
 * aktywne zadania leada (oznacza jako wykonane) i — jeśli reguła follow-upu
 * tak mówi — planuje kolejne zadanie. Każdy krok zostaje zalogowany w historii.
 */
export async function performQuickAction(leadId: string, actionKey: string): Promise<void> {
  const action = QUICK_ACTIONS.find((a) => a.key === actionKey)
  if (!action) return

  const lead = await LeadRepository.getById(leadId)
  if (!lead) return

  if (lead.status !== action.targetStatus) {
    await LeadRepository.update(leadId, { status: action.targetStatus })
    await ActivityRepository.add(leadId, `Status zmieniony na "${action.targetStatus}"`)
  }

  const openTasks = await TaskRepository.getActiveByLead(leadId)
  for (const task of openTasks) {
    await TaskRepository.complete(task.id)
    await ActivityRepository.add(leadId, `Zamknięto zadanie: ${task.title}`)
  }

  if (action.nextTask) {
    await TaskRepository.add(
      {
        leadId,
        title: action.nextTask.label,
        description: "",
        type: action.nextTask.type,
        priority: lead.priority,
        dueDate: isoDateFromToday(action.nextTask.daysOffset),
      },
      { isAutomaticallyCreated: true }
    )
    await ActivityRepository.add(leadId, `Zaplanowano zadanie: ${action.nextTask.label}`)
  }
}

/**
 * Jednoklikowe utworzenie zadania określonego typu (Analiza/Demo/Wiadomość/E-mail/Telefon/Inne)
 * z domyślną etykietą i terminem z TASK_TYPE_CONFIG.
 */
export async function createQuickTask(
  leadId: string,
  type: TaskType,
  dateOverride?: string
): Promise<void> {
  const lead = await LeadRepository.getById(leadId)
  const config = TASK_TYPE_CONFIG[type]
  const dueDate = dateOverride ?? isoDateFromToday(config.defaultDaysOffset)

  await TaskRepository.add(
    {
      leadId,
      title: config.defaultTaskLabel,
      description: "",
      type,
      priority: lead?.priority ?? "Średni",
      dueDate,
    },
    { isAutomaticallyCreated: true }
  )
  await ActivityRepository.add(leadId, `Zaplanowano zadanie: ${config.defaultTaskLabel}`)
}

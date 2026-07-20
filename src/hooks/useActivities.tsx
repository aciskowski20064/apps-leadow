import { useCallback, useEffect, useState } from "react"
import { ActivityRepository } from "@/data/repositories/ActivityRepository"
import type { Activity } from "@/types/activity"

export function useActivities(leadId: string) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    if (!leadId) {
      setActivities([])
      setLoaded(true)
      return
    }
    const data = await ActivityRepository.getByLead(leadId)
    setActivities(data)
    setLoaded(true)
  }, [leadId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addActivity(description: string): Promise<void> {
    await ActivityRepository.add(leadId, description)
    await refresh()
  }

  return { activities, loaded, addActivity, refresh }
}

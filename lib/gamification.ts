import { createClient } from "./client"

export interface UserStats {
  user_id: string
  points: number
  current_streak: number
  max_streak: number
  last_activity_date: string | null
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code === "PGRST116") {
    // Record doesn't exist, create it
    const newStats = {
      user_id: userId,
      points: 0,
      current_streak: 0,
      max_streak: 0,
      last_activity_date: null,
    }
    const { data: createdData, error: createError } = await supabase
      .from("user_stats")
      .insert(newStats)
      .select()
      .single()
    
    if (createError) return null
    return createdData
  }

  if (!data) return null

  // Check if user missed a day since their last activity
  const today = new Date().toISOString().split("T")[0]
  const lastActivity = data.last_activity_date

  if (lastActivity && lastActivity !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    // If last activity was neither today nor yesterday, the streak is broken and resets to 0
    if (lastActivity !== yesterdayStr && data.current_streak > 0) {
      const { data: updatedData } = await supabase
        .from("user_stats")
        .update({ current_streak: 0, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()
        .single()

      return updatedData || { ...data, current_streak: 0 }
    }
  }

  return data
}

export async function updateActivity(userId: string, pointsToAdd: number = 10) {
  const supabase = createClient()
  const stats = await getUserStats(userId)
  if (!stats) return null

  const today = new Date().toISOString().split("T")[0]
  const lastActivity = stats.last_activity_date

  let newStreak = stats.current_streak
  let newMaxStreak = stats.max_streak
  let newPoints = stats.points + pointsToAdd

  if (lastActivity === today) {
    // Already active today, just add points for new activities
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (lastActivity === yesterdayStr) {
      newStreak += 1
    } else {
      newStreak = 1 // Reset streak but count today's check-in as day 1
    }

    if (newStreak > newMaxStreak) {
      newMaxStreak = newStreak
    }
  }

  const { data, error } = await supabase
    .from("user_stats")
    .update({
      points: newPoints,
      current_streak: newStreak,
      max_streak: newMaxStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  return data
}

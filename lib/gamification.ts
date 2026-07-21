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
    // Already active today, just add points if they did a new activity
    // But usually we only increment points once per day for "Daily Mood"
    // For games, we can add points every time.
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (lastActivity === yesterdayStr) {
      newStreak += 1
    } else {
      newStreak = 1 // Reset streak but count today as day 1
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

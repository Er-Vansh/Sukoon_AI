"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { format, eachDayOfInterval, subMonths } from "date-fns"

interface MoodEntry {
  mood_value: number
  created_at: string
}

interface MoodHeatmapProps {
  entries: MoodEntry[]
}

const moodColors: Record<number, string> = {
  0: "bg-slate-400 opacity-80", // Down
  1: "bg-emerald-400 opacity-80", // Content
  2: "bg-cyan-400 opacity-80", // Peaceful
  3: "bg-amber-400 opacity-80", // Happy
  4: "bg-pink-400 opacity-80", // Excited
}

export function MoodHeatmap({ entries }: MoodHeatmapProps) {
  const days = useMemo(() => {
    const end = new Date()
    const start = subMonths(end, 6) // Show last 6 months
    return eachDayOfInterval({ start, end })
  }, [])

  const moodMap = useMemo(() => {
    const map: Record<string, number> = {}
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.created_at), "yyyy-MM-dd")
      // Store the highest mood if multiple entries exist for the same day
      map[dateKey] = Math.max(map[dateKey] || 0, entry.mood_value)
    })
    return map
  }, [entries])

  return (
    <div className="flex flex-col gap-4 overflow-x-auto pb-4">
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const moodValue = moodMap[dateKey]
          const hasMood = moodValue !== undefined

          return (
            <motion.div
              key={dateKey}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors ${
                hasMood ? moodColors[moodValue] : "bg-muted/30"
              }`}
              whileHover={{ scale: 1.5, zIndex: 10 }}
              title={`${format(day, "MMM dd, yyyy")}${hasMood ? `: Mood level ${moodValue}` : ""}`}
            />
          )
        })}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <span>No Data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-400" />
          <span>Down</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-cyan-400" />
          <span>Peaceful</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-pink-400" />
          <span>Excited</span>
        </div>
      </div>
    </div>
  )
}

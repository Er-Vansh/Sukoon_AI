"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Loader2, Activity, TrendingUp, Calendar, Sparkles } from "lucide-react"

interface MoodEntry {
  id: string
  mood_value: number
  created_at: string
}

const moodLabels: Record<number, { label: string; emoji: string; color: string }> = {
  0: { label: "Down", emoji: "😔", color: "#64748b" },
  1: { label: "Content", emoji: "😊", color: "#10b981" },
  2: { label: "Peaceful", emoji: "😌", color: "#06b6d4" },
  3: { label: "Happy", emoji: "🤗", color: "#f59e0b" },
  4: { label: "Excited", emoji: "✨", color: "#ec4899" },
}

export function MoodAnalytics({ userId }: { userId: string }) {
  const [data, setData] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMoodHistory() {
      const supabase = createClient()
      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("id, mood_value, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        
      if (moodData) {
        setData(moodData)
      }
      setIsLoading(false)
    }

    if (userId) {
      loadMoodHistory()
    }
  }, [userId])

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16 border-primary/20 bg-card/60 backdrop-blur-md">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-border/80 bg-card/40">
        <Activity className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
        <p className="text-sm text-muted-foreground font-medium">No mood check-ins recorded yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Log your mood daily to see your emotional trends over time.</p>
      </Card>
    )
  }

  // Format data for chart
  const chartData = data.map((entry) => {
    const date = new Date(entry.created_at)
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: entry.mood_value,
      fullDate: entry.created_at
    }
  })

  // Calculate summary stats
  const avgMood = (data.reduce((acc, curr) => acc + curr.mood_value, 0) / data.length).toFixed(1)
  const avgMoodIndex = Math.min(4, Math.max(0, Math.round(Number(avgMood))))
  const latestMood = moodLabels[data[data.length - 1]?.mood_value] || moodLabels[2]

  const yAxisTicks = [0, 1, 2, 3, 4]
  const tickFormatter = (val: number) => {
    const info = moodLabels[val]
    return info ? `${info.emoji} ${info.label}` : ""
  }

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload
      const moodInfo = moodLabels[dataItem.mood as number] || moodLabels[2]
      return (
        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl space-y-1 text-xs">
          <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 font-medium">
            <span className="text-muted-foreground">{dataItem.date} • {dataItem.time}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg">{moodInfo.emoji}</span>
            <span className="font-semibold text-sm text-foreground">{moodInfo.label}</span>
            <span className="text-muted-foreground text-[11px] font-mono">({dataItem.mood}/4)</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-primary/20 bg-card/70 backdrop-blur-xl shadow-xs rounded-3xl overflow-hidden transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-primary" />
              Mood Analytics
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Visualizing emotional patterns & check-in history
            </CardDescription>
          </div>

          {/* KPI Summary Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Avg:</span>
              <span className="text-foreground font-semibold">{moodLabels[avgMoodIndex]?.emoji} {avgMood} / 4</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-xs font-medium text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{data.length} Check-ins</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-6 px-4 sm:px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: 5, bottom: 15 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="var(--border)" 
                strokeOpacity={0.4} 
              />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis 
                domain={[0, 4]} 
                ticks={yAxisTicks} 
                tickFormatter={tickFormatter}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={85}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area 
                type="monotone" 
                dataKey="mood" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#moodGradient)"
                dot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 3 }}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}


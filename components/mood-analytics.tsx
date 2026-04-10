"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Loader2, Activity } from "lucide-react"

interface MoodEntry {
  id: string
  mood_value: number
  created_at: string
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
      <Card className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    )
  }

  if (data.length === 0) {
    return null
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
  
  const yAxisTicks = [0, 1, 2, 3, 4]
  const tickFormatter = (val: number) => {
     switch(val) {
        case 0: return "😔 Down"
        case 1: return "😊 Content"
        case 2: return "😌 Peace"
        case 3: return "🤗 Happy"
        case 4: return "✨ Excited"
        default: return ""
     }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Activity className="h-5 w-5 text-primary" />
          Mood Analytics
        </CardTitle>
        <CardDescription>Track your emotional journey over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                domain={[0, 4]} 
                ticks={yAxisTicks} 
                tickFormatter={tickFormatter}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "8px", 
                  background: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))"
                }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                formatter={(value: number) => [tickFormatter(value), "Mood"]}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

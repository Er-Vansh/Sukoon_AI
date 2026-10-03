"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Info } from "lucide-react"

export function PatientProgressChart({ patientId, patientName }: { patientId: string, patientName: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPatientMoods() {
      const supabase = createClient()
      const { data: moodData } = await supabase
        .from("mood_entries")
        .select("mood_value, created_at")
        .eq("user_id", patientId)
        .order("created_at", { ascending: true })
        
      if (moodData) {
        setData(moodData.map((d: { mood_value: number; created_at: string }) => ({
          date: new Date(d.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          mood: d.mood_value,
        })))
      }
      setIsLoading(false)
    }

    if (patientId) loadPatientMoods()
  }, [patientId])

  if (isLoading) return <div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>

  if (data.length === 0) return (
    <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
       No mood data available for this patient yet.
    </div>
  )

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mood Trends - {patientName}
        </CardTitle>
        <CardDescription>Visual summary of the patient's reported moods over time</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: "12px", background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "var(--primary)" }}
                activeDot={{ r: 6, fill: "var(--primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded-lg flex gap-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <p>This data is shared to help you monitor patient progress between sessions. Use these insights to guide your clinical discussions.</p>
        </div>
      </CardContent>
    </Card>
  )
}


"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoodHeatmap } from "@/components/mood-heatmap"
import { ChevronLeft, Calendar as CalendarIcon, History } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function MoodHistoryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMoodHistory() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        
        if (data) setEntries(data)
      }
      setIsLoading(false)
    }

    loadMoodHistory()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-foreground">Mood History</h1>
            <p className="text-muted-foreground mt-1">Reflect on your emotional journey over the past 6 months.</p>
          </header>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Mood Calendar
              </CardTitle>
              <CardDescription>Hover over squares to see mood details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : entries.length > 0 ? (
                <MoodHeatmap entries={entries} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                   <p>No mood entries found yet. Start tracking to see your calendar!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                 <History className="h-5 w-5 text-primary" />
                 Detailed Log
              </CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                 <div className="space-y-4">
                   <Skeleton className="h-12 w-full" />
                   <Skeleton className="h-12 w-full" />
                   <Skeleton className="h-12 w-full" />
                 </div>
               ) : entries.length > 0 ? (
                 <div className="space-y-4">
                   {entries.map((entry) => (
                     <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {entry.mood_value === 0 ? "😔" : 
                             entry.mood_value === 1 ? "😊" :
                             entry.mood_value === 2 ? "😌" :
                             entry.mood_value === 3 ? "🤗" : "✨"}
                          </span>
                          <div>
                            <p className="font-semibold">{entry.mood_label}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Value: {entry.mood_value}</Badge>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-center py-8 text-muted-foreground">Nothing to show yet.</p>
               )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

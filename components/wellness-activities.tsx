"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Check, Brain, Wind, Sparkles, Moon, Target, Heart } from "lucide-react"
import { createClient } from "@/lib/client"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Activity {
  id: string
  title: string
  description: string
  category: string
  duration_minutes: number
  audio_url?: string
  video_url?: string
  thumbnail_url?: string
}

interface ActivityLog {
  activity_id: string
  started_at: string
}

const categoryIcons = {
  meditation: Brain,
  breathing: Wind,
  relaxation: Sparkles,
  mindfulness: Heart,
  sleep: Moon,
  focus: Target,
}

const categoryColors = {
  meditation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  breathing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  relaxation: "bg-green-500/10 text-green-500 border-green-500/20",
  mindfulness: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  sleep: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  focus: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

export function WellnessActivities({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadActivities()
    loadTodayStats()
  }, [])

  async function loadActivities() {
    const { data, error } = await supabase
      .from("wellness_activities")
      .select("*")
      .order("category", { ascending: true })

    if (!error && data) {
      setActivities(data)
    }
  }

  async function loadTodayStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("activity_logs")
      .select("activity_id, started_at")
      .eq("user_id", userId)
      .gte("started_at", today.toISOString())

    if (!error && data) {
      setTodayCount(data.length)
      const ids = new Set(data.map((log: any) => log.activity_id).filter((id: any) => id) as string[])
      setCompletedIds(ids)
    }
  }

  async function logActivity(activityId: string, completed = false) {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_id: activityId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })

    if (!error) {
      await loadTodayStats()
      if (completed) {
        toast({
          title: "Activity Completed!",
          description: "Great job taking care of your mental health today.",
        })
      }
    }
  }

  function handlePlay(activityId: string) {
    if (playingId === activityId) {
      setPlayingId(null)
    } else {
      setPlayingId(activityId)
      logActivity(activityId, false)
    }
  }

  function handleComplete(activityId: string) {
    logActivity(activityId, true)
    setPlayingId(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Activities Today</h3>
              <motion.p
                className="text-5xl font-bold text-primary"
                key={todayCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {todayCount}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-2">Keep up the great work!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activities.map((activity) => {
          const Icon = categoryIcons[activity.category as keyof typeof categoryIcons] || Brain
          const isCompleted = completedIds.has(activity.id)
          const isPlaying = playingId === activity.id

          return (
            <motion.div key={activity.id} variants={itemVariants}>
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card
                  className={`h-full ${categoryColors[activity.category as keyof typeof categoryColors]} border-2 transition-all`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-5 w-5" />
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <Badge variant="default" className="text-xs gap-1">
                                <Check className="h-3 w-3" />
                                Done
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">{activity.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs mt-2">
                      {activity.duration_minutes} min
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handlePlay(activity.id)}
                          variant={isPlaying ? "secondary" : "default"}
                          size="sm"
                          className="w-full gap-2"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Play
                            </>
                          )}
                        </Button>
                      </motion.div>
                      {isPlaying && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleComplete(activity.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Complete
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

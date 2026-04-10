"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Calendar, LogOut, Clock, Loader2, Heart, NotebookPen, Sparkles } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { AnxietyGames } from "@/components/anxiety-games"
import { ThreeScene } from "@/components/three-scene"
import { MoodAnalytics } from "@/components/mood-analytics"
import { LeaveReviewDialog } from "@/components/leave-review-dialog"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"

const moods = [
  { emoji: "😔", label: "Down", value: 0 },
  { emoji: "😊", label: "Content", value: 1 },
  { emoji: "😌", label: "Peaceful", value: 2 },
  { emoji: "🤗", label: "Happy", value: 3 },
  { emoji: "✨", label: "Excited", value: 4 },
]

const moodSuggestions: Record<number, string[]> = {
  0: ["5-4-3-2-1 Grounding", "Body Scan Relaxation", "Breathing Patterns"],
  1: ["Desk Stretch Break", "Ocean Waves", "Memory Map"],
  2: ["Gentle Yoga Flow", "Mindful Forest", "Zen Garden"],
  3: ["Gratitude Journal", "Memory Map", "Gentle Yoga Flow"],
  4: ["Mindful Forest", "Zen Garden", "Gratitude Journal"],
}

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [pastAppointments, setPastAppointments] = useState<any[]>([])
  const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([])
  const [selectedMood, setSelectedMood] = useState(2)
  const [savedMood, setSavedMood] = useState<number | null>(null)
  const [isSavingMood, setIsSavingMood] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
    const [todayActivityCount, setTodayActivityCount] = useState(0)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
      async function loadData() {
        try {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser()

          if (!currentUser) {
            router.push("/auth/login")
            return
          }

          setUser(currentUser)

          const [profileRes, requestsRes, appointmentsRes, pastAppointmentsRes, activityLogsRes, gratitudeRes, moodRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
            supabase
              .from("consultation_requests")
              .select(`*, profiles!consultation_requests_counsellor_id_fkey(full_name)`)
              .eq("patient_id", currentUser.id)
              .order("created_at", { ascending: false })
              .limit(5),
            supabase
              .from("appointments")
              .select(`*, profiles!appointments_counsellor_id_fkey(full_name)`)
              .eq("patient_id", currentUser.id)
              .gte("scheduled_date", new Date().toISOString())
              .order("scheduled_date", { ascending: true })
              .limit(5),
            supabase
              .from("appointments")
              .select(`*, profiles!appointments_counsellor_id_fkey(full_name), counsellor_reviews(id)`)
              .eq("patient_id", currentUser.id)
              .lt("scheduled_date", new Date().toISOString())
              .order("scheduled_date", { ascending: false })
              .limit(5),
              supabase
                .from("activity_logs")
                .select("id")
                .eq("user_id", currentUser.id)
                .gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
              supabase
                .from("gratitude_entries")
                .select("id, content, created_at")
                .eq("user_id", currentUser.id)
                .order("created_at", { ascending: false })
                .limit(3),
              supabase
                .from("mood_entries")
                .select("mood_value")
                .eq("user_id", currentUser.id)
                .order("created_at", { ascending: false })
                .limit(1),
          ])

          const userType = profileRes.data?.user_type || currentUser.user_metadata?.user_type

          if (userType === "counsellor") {
            router.push("/counsellor/dashboard")
            return
          }

          setProfile(profileRes.data)
          setRequests(requestsRes.data || [])
          setAppointments(appointmentsRes.data || [])
          setPastAppointments(pastAppointmentsRes.data || [])
          setTodayActivityCount(activityLogsRes.data?.length || 0)
          setGratitudeEntries(gratitudeRes.data || [])
          const latestMood = moodRes.data?.[0]?.mood_value
          if (typeof latestMood === "number") {
            setSelectedMood(latestMood)
            setSavedMood(latestMood)
          }
        } catch (error) {
          console.error("Error loading dashboard:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadData()
    }, [router, supabase])

    const handleGamePlayed = async (gameName: string, description: string) => {
      if (!user) return

      try {
        const { error } = await supabase.from("activity_logs").insert({
          user_id: user.id,
          activity_type: "wellness_game",
          activity_name: gameName,
          activity_description: description,
          completed_at: new Date().toISOString(),
        })

          if (!error) {
            setTodayActivityCount((prev) => prev + 1)
          }
      } catch (error) {
        console.error("Error logging activity:", error)
      }
    }

    const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.push("/auth/login")
    }

  const saveMood = async () => {
    if (!user) return
    setIsSavingMood(true)
    try {
      const currentMood = moods[selectedMood]
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user.id,
        mood_value: selectedMood,
        mood_label: currentMood.label,
      })
      if (!error) {
        setSavedMood(selectedMood)
      }
    } catch (error) {
      console.error("Error saving mood:", error)
    } finally {
      setIsSavingMood(false)
    }
  }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
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
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <ThreeScene />
        <AppHeader />

        <motion.div
          className="bg-linear-to-br from-primary/5 via-primary/10 to-background border-b"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {profile?.full_name}</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">Your wellness dashboard</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-background/80 hover:bg-background"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="container mx-auto px-4 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden">
                    <CardContent className="pt-6 relative z-10">
                    <div className="text-center">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                        <Heart className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Activities Completed Today</h3>
                      <motion.p
                        className="text-5xl font-bold text-primary"
                      key={todayActivityCount}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {todayActivityCount}
                    </motion.p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {todayActivityCount === 0 ? "Start your wellness journey today!" : "Keep up the great work!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <Card
              className="border-primary/20 transition-colors duration-500"
              style={{
                background: `linear-gradient(135deg, var(--card) 0%, ${
                  selectedMood === 0
                    ? "rgba(148, 163, 184, 0.12)"
                    : selectedMood === 1
                      ? "rgba(16, 185, 129, 0.12)"
                      : selectedMood === 2
                        ? "rgba(6, 182, 212, 0.12)"
                        : selectedMood === 3
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(236, 72, 153, 0.12)"
                } 100%)`,
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Mood Check-In
                </CardTitle>
                <CardDescription>Track your mood and get personalized activity suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between text-3xl md:text-4xl">
                  {moods.map((mood, index) => (
                    <motion.button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: selectedMood === index ? 1.2 : 1,
                        filter: selectedMood === index ? "grayscale(0%)" : "grayscale(60%)",
                      }}
                    >
                      {mood.emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, ${
                        selectedMood >= 0 ? "#94a3b8" : "#e2e8f0"
                      } 0%, ${
                        selectedMood >= 1 ? "#10b981" : "#e2e8f0"
                      } 25%, ${
                        selectedMood >= 2 ? "#06b6d4" : "#e2e8f0"
                      } 50%, ${
                        selectedMood >= 3 ? "#f59e0b" : "#e2e8f0"
                      } 75%, ${
                        selectedMood >= 4 ? "#ec4899" : "#e2e8f0"
                      } 100%)`,
                    }}
                  />
                  <motion.div
                    className="absolute -top-8 px-3 py-1 rounded-md text-sm font-medium text-primary-foreground shadow-sm"
                    animate={{
                      left: `${(selectedMood / 4) * 100}%`,
                      x: "-50%",
                      backgroundColor:
                        selectedMood === 0
                          ? "#94a3b8"
                          : selectedMood === 1
                            ? "#10b981"
                            : selectedMood === 2
                              ? "#06b6d4"
                              : selectedMood === 3
                                ? "#f59e0b"
                                : "#ec4899",
                    }}
                  >
                    {moods[selectedMood].label}
                  </motion.div>
                </div>
                <Button onClick={saveMood} disabled={isSavingMood} className="w-full md:w-auto">
                  {isSavingMood ? "Saving Mood..." : "Save Mood"}
                </Button>

                {savedMood !== null && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Suggested for your current mood:</p>
                    <div className="flex flex-wrap gap-2">
                      {moodSuggestions[savedMood].map((suggestion) => (
                        <Badge key={suggestion} variant="secondary" className="py-1">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <AnxietyGames userId={user!.id} onGamePlayed={handleGamePlayed} />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <NotebookPen className="h-5 w-5" />
                  Your Gratitude Journal
                </CardTitle>
                <CardDescription>Your latest gratitude notes from interactive activities</CardDescription>
              </CardHeader>
              <CardContent>
                {gratitudeEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm md:text-base">No gratitude entries yet</p>
                    <p className="text-xs mt-1">Open Gratitude Journal in activities and save your first note.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gratitudeEntries.map((entry) => (
                      <div key={entry.id} className="rounded-lg border p-4 bg-muted/30">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                          <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          AI Therapy Chat
                        </CardTitle>
                        <CardDescription className="text-sm">Connect with our compassionate AI therapist for support anytime, anywhere.</CardDescription>
                      </CardHeader>
                        <CardContent>
                          <a href="https://frontend-9pry.vercel.app/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button className="w-full">Start Session</Button>
                            </motion.div>
                          </a>
                        </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="bg-linear-to-br from-accent/20 to-accent/5 border-accent/30 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                          <Users className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
                          Professional Counsellors
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Connect with licensed professionals for deeper support.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href="/counsellors">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="secondary" className="w-full">
                              Browse Counsellors
                            </Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>

          <motion.div variants={itemVariants}>
            <Card className="mb-6 md:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Calendar className="h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled professional sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm md:text-base">No upcoming appointments</p>
                      <Link href="/counsellors">
                        <Button variant="link" className="mt-2">
                          Book a Session
                        </Button>
                      </Link>
                    </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{appointment.profiles?.full_name}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.scheduled_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(appointment.scheduled_date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        {appointment.meeting_link && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" asChild className="w-full sm:w-auto">
                                <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
                                  Join Meeting
                                </a>
                              </Button>
                            </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="mb-6 md:mb-8 bg-muted/20 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    Past Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No past appointments</p>
                    </div>
                ) : (
                  <div className="space-y-3">
                    {pastAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 opacity-80"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{appointment.profiles?.full_name}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div>
                           {appointment.counsellor_reviews && appointment.counsellor_reviews.length > 0 ? (
                             <Badge variant="outline" className="text-muted-foreground">Reviewed</Badge>
                           ) : (
                             <LeaveReviewDialog
                               patientId={user!.id}
                               counsellorId={appointment.counsellor_id}
                               appointmentId={appointment.id}
                             />
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Consultation Requests</CardTitle>
                  <CardDescription>Track the status of your counsellor requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm md:text-base">No active requests</p>
                    </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <motion.div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{request.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.full_name ? `With ${request.profiles.full_name}` : "Awaiting assignment"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "accepted"
                              ? "default"
                              : request.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                          className="w-fit"
                        >
                          {request.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <AppFooter />
      </div>
    )
  }

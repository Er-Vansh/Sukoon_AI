"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Users,
  Calendar,
  LogOut,
  Clock,
  Heart,
  NotebookPen,
  Sparkles,
  RefreshCw,
  Flame,
  Activity,
  Award,
  Zap,
  ChevronRight,
  Smile,
  ShieldAlert,
  PlayCircle,
  CheckCircle2,
  Plus,
  BarChart3,
  CalendarDays,
  Gamepad2,
} from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import dynamic from "next/dynamic"
import type { User } from "@supabase/supabase-js"

import { getUserStats, updateActivity, type UserStats } from "@/lib/gamification"
import { ConfettiBurst } from "@/components/confetti-burst"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const MoodAnalytics = dynamic(() => import("@/components/mood-analytics").then((mod: any) => mod.MoodAnalytics), { ssr: false }) as any
const MoodHeatmap = dynamic(() => import("@/components/mood-heatmap").then((mod: any) => mod.MoodHeatmap), { ssr: false }) as any
const AnxietyGames = dynamic(() => import("@/components/anxiety-games").then((mod: any) => mod.AnxietyGames), { 
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />
}) as any
const BreathingGame = dynamic(() => import("@/components/breathing-game").then((mod: any) => mod.BreathingGame), { ssr: false })
const OnboardingTour = dynamic(() => import("@/components/onboarding-tour").then((mod: any) => mod.OnboardingTour), { ssr: false })
const LeaveReviewDialog = dynamic(() => import("@/components/leave-review-dialog").then((mod: any) => mod.LeaveReviewDialog), { ssr: false }) as any
const WellnessStreaks = dynamic(() => import("@/components/wellness-streaks").then((mod: any) => mod.WellnessStreaks), { ssr: false }) as any

const moods = [
  { emoji: "😔", label: "Down", value: 0, accent: "from-slate-500/20 to-slate-600/10 border-slate-500/30" },
  { emoji: "😊", label: "Content", value: 1, accent: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30" },
  { emoji: "😌", label: "Peaceful", value: 2, accent: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30" },
  { emoji: "🤗", label: "Happy", value: 3, accent: "from-amber-500/20 to-orange-600/10 border-amber-500/30" },
  { emoji: "✨", label: "Excited", value: 4, accent: "from-pink-500/20 to-rose-600/10 border-pink-500/30" },
]

const moodSuggestions: Record<number, { name: string; tag: string }[]> = {
  0: [{ name: "5-4-3-2-1 Grounding", tag: "Calming" }, { name: "Body Scan Relaxation", tag: "Body" }, { name: "Breathing Patterns", tag: "Mind" }],
  1: [{ name: "Desk Stretch Break", tag: "Energy" }, { name: "Ocean Waves", tag: "Audio" }, { name: "Memory Map", tag: "Focus" }],
  2: [{ name: "Gentle Yoga Flow", tag: "Body" }, { name: "Mindful Forest", tag: "Zen" }, { name: "Zen Garden", tag: "Peace" }],
  3: [{ name: "Gratitude Journal", tag: "Reflect" }, { name: "Memory Map", tag: "Focus" }, { name: "Gentle Yoga Flow", tag: "Body" }],
  4: [{ name: "Mindful Forest", tag: "Explore" }, { name: "Zen Garden", tag: "Creative" }, { name: "Gratitude Journal", tag: "Reflect" }],
}

const WELLNESS_QUOTES = [
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "The secret of health for both mind and body is to live in the present moment wisely and earnestly.", author: "Proverb" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know for sure.", author: "Oprah Winfrey" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
]

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [pastAppointments, setPastAppointments] = useState<any[]>([])
  const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([])
  const [allMoodEntries, setAllMoodEntries] = useState<any[]>([])
  const [selectedMood, setSelectedMood] = useState(2)
  const [savedMood, setSavedMood] = useState<number | null>(null)
  const [isSavingMood, setIsSavingMood] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [todayActivityCount, setTodayActivityCount] = useState(0)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // New Reflection Dialog State
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  // Quick Breathing Modal
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false)

  // Quote State
  const [quoteIndex, setQuoteIndex] = useState(0)

  const router = useRouter()

  useEffect(() => {
    // Pick a quote based on the day
    setQuoteIndex(new Date().getDate() % WELLNESS_QUOTES.length)
  }, [])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)

        const [
          profileRes,
          requestsRes,
          appointmentsRes,
          pastAppointmentsRes,
          activityLogsRes,
          gratitudeRes,
          moodRes,
          allMoodsRes,
          statsData
        ] = await Promise.all([
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
            .limit(5),
          supabase
            .from("mood_entries")
            .select("mood_value")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("mood_entries")
            .select("mood_value, created_at")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(180),
          getUserStats(currentUser.id)
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
        setAllMoodEntries(allMoodsRes.data || [])
        setStats(statsData)

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
  }, [router])

  const handleGamePlayed = async (gameName: string, description: string) => {
    if (!user) return
    const supabase = createClient()

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
        const updatedStats = await updateActivity(user.id, 20)
        if (updatedStats) setStats(updatedStats)
        setShowConfetti(true)
      }
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const saveMood = async () => {
    if (!user) return
    setIsSavingMood(true)
    const supabase = createClient()
    try {
      const currentMood = moods[selectedMood]
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user.id,
        mood_value: selectedMood,
        mood_label: currentMood.label,
      })
      if (!error) {
        setSavedMood(selectedMood)
        setShowConfetti(true)
        setAllMoodEntries((prev) => [{ mood_value: selectedMood, created_at: new Date().toISOString() }, ...prev])
        const updatedStats = await updateActivity(user.id, 10)
        if (updatedStats) setStats(updatedStats)
      }
    } catch (error) {
      console.error("Error saving mood:", error)
    } finally {
      setIsSavingMood(false)
    }
  }

  const handleAddGratitude = async () => {
    if (!user || !newNote.trim()) return
    setIsAddingNote(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("gratitude_entries").insert({
        user_id: user.id,
        content: newNote.trim(),
      }).select().single()

      if (!error && data) {
        setGratitudeEntries((prev) => [data, ...prev])
        setNewNote("")
        setIsNoteModalOpen(false)
        setShowConfetti(true)
        const updatedStats = await updateActivity(user.id, 15)
        if (updatedStats) setStats(updatedStats)
      }
    } catch (err) {
      console.error("Error adding gratitude entry:", err)
    } finally {
      setIsAddingNote(false)
    }
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: "Good Morning 🌅", subtext: "Start your day with a calm mind" }
    if (hour < 17) return { text: "Good Afternoon ☀️", subtext: "Take a mindful break & recharge" }
    return { text: "Good Evening 🌙", subtext: "Unwind & reflect on your day" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] rounded-3xl" />
            <Skeleton className="h-[200px] rounded-3xl" />
            <Skeleton className="h-[200px] rounded-3xl" />
          </div>
          <Skeleton className="h-[350px] w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  const greeting = getTimeOfDayGreeting()
  const currentQuote = WELLNESS_QUOTES[quoteIndex]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/20">
      <OnboardingTour />
      <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AppHeader />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-primary/15 via-primary/5 to-accent/10 border-b border-primary/20 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Greeting */}
            <div className="flex items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {greeting.text}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  Welcome back, <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">{profile?.full_name || "Friend"}</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">{greeting.subtext}</p>
              </div>
            </div>

            {/* Right: Daily Quote & Quick Breathing CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Card className="bg-card/60 backdrop-blur-md border-primary/20 p-4 rounded-2xl max-w-md relative shadow-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs italic text-foreground leading-relaxed font-medium">"{currentQuote.text}"</p>
                    <p className="text-[10px] text-muted-foreground text-right">— {currentQuote.author}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 rounded-full hover:bg-primary/10"
                    onClick={() => setQuoteIndex((prev) => (prev + 1) % WELLNESS_QUOTES.length)}
                    title="Next Quote"
                  >
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </Card>

              <Dialog open={isBreathingModalOpen} onOpenChange={setIsBreathingModalOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="h-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white rounded-2xl font-bold px-5 shadow-lg shadow-primary/20 gap-2">
                      <PlayCircle className="h-5 w-5 animate-pulse" />
                      Quick Zen Breath
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20 rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                      <Sparkles className="h-5 w-5 text-primary" /> Mindful Breathing Exercise
                    </DialogTitle>
                    <DialogDescription>Take 2 minutes to center your focus and relieve stress.</DialogDescription>
                  </DialogHeader>
                  <BreathingGame />
                </DialogContent>
              </Dialog>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="icon"
                  className="rounded-2xl border-primary/20 h-11 w-11 bg-background/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shadow-xs"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Main Bento Grid Workspace */}
      <motion.main
        className="container mx-auto px-4 py-8 space-y-8 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 1: Streaks & Gamification Banner */}
        <motion.div variants={cardItemVariants}>
          <WellnessStreaks userId={user?.id} stats={stats} onStreakUpdated={(updated: UserStats) => setStats(updated)} />
        </motion.div>

        {/* Section 2: Bento Grid Level 1 — Metrics & Mood Check-In */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 3 Quick Metric Cards (Lg 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Card 1: Activities Today */}
            <motion.div variants={cardItemVariants} className="flex-1">
              <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-card border-primary/20 rounded-3xl shadow-lg hover:shadow-primary/10 transition-all group overflow-hidden relative h-full">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" /> Daily Mindful Acts
                    </p>
                    <motion.p
                      key={todayActivityCount}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 220 }}
                      className="text-4xl font-black text-primary tracking-tight"
                    >
                      {todayActivityCount} <span className="text-sm font-semibold text-muted-foreground">completed</span>
                    </motion.p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-md shadow-primary/10"
                  >
                    <Heart className="h-7 w-7 text-primary fill-primary/20" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Active Streak */}
            <motion.div variants={cardItemVariants} className="flex-1">
              <Card className="bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-card border-orange-500/20 rounded-3xl shadow-lg hover:shadow-orange-500/10 transition-all group overflow-hidden relative h-full">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-500" /> Active Streak
                    </p>
                    <motion.p
                      key={stats?.current_streak}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 220 }}
                      className="text-4xl font-black text-orange-500 tracking-tight"
                    >
                      {stats?.current_streak || 0} <span className="text-sm font-semibold text-muted-foreground">days</span>
                    </motion.p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -12 }}
                    className="h-14 w-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md shadow-orange-500/10"
                  >
                    <Flame className="h-7 w-7 text-orange-500 fill-orange-500/20" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Wellness Points & Level */}
            <motion.div variants={cardItemVariants} className="flex-1">
              <Card className="bg-gradient-to-br from-purple-500/15 via-violet-500/5 to-card border-purple-500/20 rounded-3xl shadow-lg hover:shadow-purple-500/10 transition-all group overflow-hidden relative h-full">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-purple-500" /> Wellness Points
                    </p>
                    <motion.p
                      key={stats?.points}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 220 }}
                      className="text-4xl font-black text-purple-500 tracking-tight"
                    >
                      {stats?.points || 0} <span className="text-sm font-semibold text-muted-foreground">pts</span>
                    </motion.p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, y: -4 }}
                    className="h-14 w-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-md shadow-purple-500/10 font-black text-lg"
                  >
                    ★
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Right Column: Mood Check-In Interactive Bento Widget (Lg 8 cols) */}
          <motion.div variants={cardItemVariants} className="lg:col-span-8">
            <Card className="border-primary/20 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden relative h-full flex flex-col justify-between transition-colors duration-500 bg-card/80">
              <div
                className={`absolute inset-0 opacity-25 bg-gradient-to-br transition-all duration-700 pointer-events-none ${moods[selectedMood].accent}`}
              />

              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                      <Smile className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Daily Mood Check-In</CardTitle>
                      <CardDescription>Track how you feel today to receive tailored wellness suggestions</CardDescription>
                    </div>
                  </div>
                  {savedMood !== null && (
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 font-bold py-1 px-3">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Emoji Selector Grid */}
                <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto w-full pt-2">
                  {moods.map((mood) => {
                    const isSelected = selectedMood === mood.value
                    return (
                      <motion.button
                        key={mood.value}
                        type="button"
                        onClick={() => setSelectedMood(mood.value)}
                        whileHover={{ scale: 1.25, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/40 scale-110"
                            : "bg-muted/30 border-border/40 hover:bg-muted/60 opacity-60 grayscale hover:grayscale-0"
                        }`}
                      >
                        <span className="text-3xl md:text-4xl">{mood.emoji}</span>
                        <span className={`text-[11px] font-bold mt-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {mood.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Range Slider */}
                <div className="space-y-2 max-w-lg mx-auto w-full">
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary bg-muted/60"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground px-1">
                    <span>Down</span>
                    <span>Content</span>
                    <span>Peaceful</span>
                    <span>Happy</span>
                    <span>Excited</span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/60">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      Current selection: <span className="text-primary font-black">{moods[selectedMood].label} {moods[selectedMood].emoji}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Logging daily mood increases your mindfulness streak</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button
                      onClick={saveMood}
                      disabled={isSavingMood}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white rounded-2xl font-bold px-6 shadow-md shadow-primary/20 gap-2 h-11"
                    >
                      {isSavingMood ? "Saving..." : "Log Mood Entry (+10 Pts)"}
                    </Button>
                  </motion.div>
                </div>

                {/* Smart Activity Suggestions */}
                {savedMood !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2"
                  >
                    <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> Recommended for your mood:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {moodSuggestions[savedMood].map((suggestion) => (
                        <Badge
                          key={suggestion.name}
                          variant="secondary"
                          className="py-1.5 px-3 rounded-xl bg-card border border-border hover:border-primary/40 cursor-pointer font-bold text-xs gap-1.5 shadow-2xs transition-all"
                        >
                          <Sparkles className="h-3 w-3 text-primary" /> {suggestion.name}
                          <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                            {suggestion.tag}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Section 3: Mood Analytics & History Tabs */}
        <motion.div variants={cardItemVariants}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <Tabs defaultValue="trends" className="w-full">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" /> Mood & Sentiment Analytics
                    </CardTitle>
                    <CardDescription>Visualize your emotional patterns and wellness consistency over time</CardDescription>
                  </div>
                  <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/60">
                    <TabsTrigger value="trends" className="rounded-xl font-bold text-xs gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" /> Weekly Trends
                    </TabsTrigger>
                    <TabsTrigger value="heatmap" className="rounded-xl font-bold text-xs gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> 6-Month Heatmap
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TabsContent value="trends" className="mt-0">
                  <MoodAnalytics userId={user!.id} />
                </TabsContent>
                <TabsContent value="heatmap" className="mt-0 pt-2">
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">Daily mood intensity check-ins across the last 6 months:</p>
                    <MoodHeatmap entries={allMoodEntries} />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Section 4: Mindfulness & Anxiety Mini-Games Hub */}
        <motion.div variants={cardItemVariants}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-purple-500" /> Interactive Mindfulness & Anxiety Games
                  </CardTitle>
                  <CardDescription>Engage in calming mini-games designed to ease anxiety, improve focus, and relax your mind</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnxietyGames userId={user!.id} onGamePlayed={handleGamePlayed} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 5: Gratitude Journal Deck */}
        <motion.div variants={cardItemVariants}>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-amber-500" /> Gratitude Journal Deck
                  </CardTitle>
                  <CardDescription>Keep track of moments, thoughts, and reflections that bring joy to your day</CardDescription>
                </div>
                
                <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold gap-1.5 shadow-md shadow-amber-500/20">
                      <Plus className="h-4 w-4" /> New Reflection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm border-amber-500/30 rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <NotebookPen className="h-5 w-5 text-amber-500" /> Write a Gratitude Reflection
                      </DialogTitle>
                      <DialogDescription>What is one thing you are thankful for today?</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Textarea
                        placeholder="Today I am grateful for..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[120px] rounded-2xl border-primary/20 focus:border-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)} className="rounded-xl">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddGratitude}
                          disabled={isAddingNote || !newNote.trim()}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                        >
                          {isAddingNote ? "Saving..." : "Save Entry (+15 Pts)"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

              </div>
            </CardHeader>
            <CardContent className="p-6">
              {gratitudeEntries.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground space-y-3">
                  <NotebookPen className="h-12 w-12 mx-auto text-amber-500/40 animate-pulse" />
                  <p className="text-sm font-semibold">No gratitude entries yet</p>
                  <p className="text-xs max-w-sm mx-auto">Click "New Reflection" above to record your very first gratitude note and earn wellness points!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gratitudeEntries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-card to-card shadow-md relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Reflection #{gratitudeEntries.length - idx}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium pt-1">
                          "{entry.content}"
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border/50">
                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 6: AI Chat & Counsellor CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* AI Therapy Chat Card */}
          <motion.div variants={cardItemVariants}>
            <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-card border-primary/30 rounded-3xl shadow-xl hover:shadow-primary/20 transition-all group overflow-hidden relative h-full flex flex-col justify-between p-6">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> AI Therapist Online
                  </span>
                </div>
                <h3 className="text-2xl font-black text-foreground">AI Therapy Chat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with our compassionate, 24/7 AI therapist for confidential emotional support, guided coping techniques, and active listening whenever you need it.
                </p>
              </div>
              <div className="pt-6 relative z-10">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-12 text-sm shadow-lg shadow-primary/25 gap-2"
                  >
                    Start Chat Session <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Professional Counsellors Card */}
          <motion.div variants={cardItemVariants}>
            <Card className="bg-gradient-to-br from-accent/30 via-accent/10 to-card border-accent/40 rounded-3xl shadow-xl hover:shadow-accent/20 transition-all group overflow-hidden relative h-full flex flex-col justify-between p-6">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-accent/20 border border-accent/30 text-accent-foreground">
                    <Users className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold text-accent-foreground bg-accent/20 px-3 py-1 rounded-full border border-accent/30">
                    Licensed Experts
                  </span>
                </div>
                <h3 className="text-2xl font-black text-foreground">Professional Counsellors</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Book 1-on-1 virtual video sessions with licensed therapy professionals for personalized mental health care, structured guidance, and clinical consultation.
                </p>
              </div>
              <div className="pt-6 relative z-10">
                <Link href="/counsellors">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="secondary" className="w-full font-bold rounded-2xl h-12 text-sm shadow-md gap-2">
                      Browse Counsellors <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Section 7: Upcoming Appointments & Consultation Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Upcoming Appointments (Lg 7 cols) */}
          <motion.div variants={cardItemVariants} className="lg:col-span-7">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden h-full">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Upcoming Appointments
                </CardTitle>
                <CardDescription>Your scheduled sessions with professional counsellors</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground space-y-3">
                    <Calendar className="h-12 w-12 mx-auto opacity-40" />
                    <p className="text-sm font-semibold">No upcoming appointments scheduled</p>
                    <Link href="/counsellors">
                      <Button variant="link" className="text-primary font-bold">
                        Book a Session Now →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl bg-muted/30 border-border/60 hover:bg-muted/60 transition-all gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-extrabold text-foreground">{appointment.profiles?.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {new Date(appointment.scheduled_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {new Date(appointment.scheduled_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                        {appointment.meeting_link && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                              <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
                                Join Video Call
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

          {/* Past Appointments & Requests (Lg 5 cols) */}
          <motion.div variants={cardItemVariants} className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Consultation Requests */}
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden flex-1">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" /> Consultation Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {requests.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-xs">No active consultation requests</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 border rounded-xl bg-muted/30 border-border/50 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground truncate max-w-[180px]">{req.subject}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {req.profiles?.full_name ? `With ${req.profiles.full_name}` : "Pending assignment"}
                          </p>
                        </div>
                        <Badge
                          variant={req.status === "accepted" ? "default" : req.status === "pending" ? "secondary" : "outline"}
                          className="capitalize text-[10px] font-bold"
                        >
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden flex-1">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Past Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-xs">No past appointments recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pastAppointments.map((past) => (
                      <div
                        key={past.id}
                        className="flex items-center justify-between p-3 border rounded-xl bg-muted/20 border-border/40 text-xs opacity-90"
                      >
                        <div>
                          <p className="font-bold text-foreground">{past.profiles?.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(past.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {past.counsellor_reviews && past.counsellor_reviews.length > 0 ? (
                            <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                              ✓ Reviewed
                            </Badge>
                          ) : (
                            <LeaveReviewDialog
                              patientId={user!.id}
                              counsellorId={past.counsellor_id}
                              appointmentId={past.id}
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

        </div>

      </motion.main>

      <AppFooter />
    </div>
  )
}

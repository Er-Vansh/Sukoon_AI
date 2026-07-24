"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, Award, ShieldCheck, Heart, Sparkles, CheckCircle, Calendar, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Badge {
  id: string
  title: string
  desc: string
  icon: any
  requiredStreak: number
  unlocked: boolean
}

export function WellnessStreaks() {
  const [streakDays, setStreakDays] = useState(3)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [checkedInToday, setCheckedInToday] = useState(false)

  useEffect(() => {
    const storedStreak = localStorage.getItem("sukoon_streak_days")
    const storedLastDate = localStorage.getItem("sukoon_last_checkin_date")
    const today = new Date().toISOString().split("T")[0]

    if (storedStreak) {
      setStreakDays(parseInt(storedStreak, 10))
    }
    if (storedLastDate) {
      setLastCheckIn(storedLastDate)
      if (storedLastDate === today) {
        setCheckedInToday(true)
      }
    }
  }, [])

  const handleCheckIn = () => {
    const today = new Date().toISOString().split("T")[0]
    if (checkedInToday) return

    const newStreak = streakDays + 1
    setStreakDays(newStreak)
    setCheckedInToday(true)
    setLastCheckIn(today)

    localStorage.setItem("sukoon_streak_days", newStreak.toString())
    localStorage.setItem("sukoon_last_checkin_date", today)
  }

  const BADGES: Badge[] = [
    {
      id: "first_step",
      title: "First Step",
      desc: "Completed your 1st wellness check-in",
      icon: Heart,
      requiredStreak: 1,
      unlocked: streakDays >= 1,
    },
    {
      id: "3_day_zen",
      title: "3-Day Zen",
      desc: "Maintained a 3-day wellness streak",
      icon: Sparkles,
      requiredStreak: 3,
      unlocked: streakDays >= 3,
    },
    {
      id: "7_day_master",
      title: "Mindful Master",
      desc: "Completed a full 7-day streak",
      icon: Flame,
      requiredStreak: 7,
      unlocked: streakDays >= 7,
    },
    {
      id: "gratitude_scholar",
      title: "Gratitude Scholar",
      desc: "Logged 14 daily reflections",
      icon: Trophy,
      requiredStreak: 14,
      unlocked: streakDays >= 14,
    },
  ]

  const nextBadge = BADGES.find((b) => !b.unlocked) || BADGES[BADGES.length - 1]
  const progressPercent = Math.min(100, Math.round((streakDays / nextBadge.requiredStreak) * 100))

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Top Header & Streak Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Flame className="h-7 w-7 text-orange-500 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-foreground">{streakDays} Day Streak</h3>
                {checkedInToday && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold border border-green-500/20">
                    Checked In Today
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Check in daily to build your mindfulness habit</p>
            </div>
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={checkedInToday}
            className={`gap-2 text-xs font-semibold px-4 h-10 rounded-xl transition-all shadow-sm ${
              checkedInToday
                ? "bg-muted text-muted-foreground border border-border"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            {checkedInToday ? "Checked In" : "Claim Daily Check-In"}
          </Button>
        </div>

        {/* Progress towards next badge */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Progress to Next Badge ({nextBadge.title})</span>
            <span className="text-foreground font-bold">{streakDays} / {nextBadge.requiredStreak} Days</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>

        {/* Achievement Badges Grid */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Wellness Badges & Achievements
            </h4>
            <span className="text-xs text-muted-foreground font-medium">
              {BADGES.filter((b) => b.unlocked).length} of {BADGES.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const BIcon = badge.icon
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.03 }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between space-y-2 transition-all ${
                    badge.unlocked
                      ? "bg-card border-primary/30 shadow-sm"
                      : "bg-muted/30 border-border/50 opacity-60 grayscale"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      badge.unlocked ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <BIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-foreground">{badge.title}</h5>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{badge.desc}</p>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      badge.unlocked ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {badge.unlocked ? "Unlocked" : `${badge.requiredStreak} Days Required`}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

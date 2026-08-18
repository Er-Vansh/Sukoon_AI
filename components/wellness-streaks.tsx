"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, Award, Heart, Sparkles, CheckCircle, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ConfettiBurst } from "@/components/confetti-burst"
import { updateActivity, type UserStats } from "@/lib/gamification"

interface Badge {
  id: string
  title: string
  desc: string
  icon: any
  requiredStreak: number
  unlocked: boolean
}

interface WellnessStreaksProps {
  userId?: string
  stats?: UserStats | null
  onStreakUpdated?: (updatedStats: UserStats) => void
}

export function WellnessStreaks({ userId, stats, onStreakUpdated }: WellnessStreaksProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const streakDays = stats?.current_streak ?? 0
  const checkedInToday = stats?.last_activity_date === today

  const handleCheckIn = async () => {
    if (checkedInToday || isUpdating || !userId) return
    setIsUpdating(true)

    try {
      const updated = await updateActivity(userId, 10)
      if (updated) {
        setShowConfetti(true)
        if (onStreakUpdated) {
          onStreakUpdated(updated)
        }
      }
    } catch (err) {
      console.error("Error claiming daily streak:", err)
    } finally {
      setIsUpdating(false)
    }
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
    <Card className="border-primary/20 bg-card/70 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden relative">
      <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <CardContent className="p-6 space-y-6">
        {/* Top Header & Streak Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10"
            >
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-foreground tracking-tight">{streakDays} Day Streak</h3>
                {checkedInToday ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-500/30 shadow-xs">
                    ✓ Claimed Today
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold border border-amber-500/30 shadow-xs">
                    Ready to Claim
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Check in daily to build your mindfulness habit & unlock rewards</p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleCheckIn}
              disabled={checkedInToday || isUpdating || !userId}
              className={`gap-2 text-xs font-bold px-5 h-11 rounded-2xl transition-all shadow-md ${
                checkedInToday
                  ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              {checkedInToday ? "Checked In Today" : isUpdating ? "Claiming..." : "Claim Daily Streak (+10 Pts)"}
            </Button>
          </motion.div>
        </div>

        {/* Progress towards next badge */}
        <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border/50">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Progress to <span className="text-foreground font-bold">{nextBadge.title}</span>
            </span>
            <span className="text-primary font-black">{streakDays} / {nextBadge.requiredStreak} Days ({progressPercent}%)</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 rounded-full bg-muted/80" />
        </div>

        {/* Achievement Badges Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Wellness Badges & Achievements
            </h4>
            <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              {BADGES.filter((b) => b.unlocked).length} of {BADGES.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const BIcon = badge.icon
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-2.5 transition-all ${
                    badge.unlocked
                      ? "bg-gradient-to-b from-card to-primary/5 border-primary/40 shadow-md shadow-primary/5"
                      : "bg-muted/20 border-border/40 opacity-55 grayscale"
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-transform ${
                      badge.unlocked ? "bg-primary/15 text-primary border border-primary/30 shadow-inner" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <BIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-foreground">{badge.title}</h5>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-1">{badge.desc}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                      badge.unlocked ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {badge.unlocked ? "Unlocked ✨" : `${badge.requiredStreak} Days Required`}
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

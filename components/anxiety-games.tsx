"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Flower2, Wind, TreePine, Waves, Music2, Brain, Dumbbell, NotebookPen, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/client"
import { BreathingGame } from "./breathing-game"
import { ZenGarden } from "./zen-garden"
import { ForestGame } from "./forest-game"
import { OceanWaves } from "./ocean-waves"
import { MemoryMap } from "./memory-map"

interface GuidedRoutineProps {
  title: string
  description: string
  steps: string[]
  tip: string
  image: string
}

const GuidedRoutine = ({ title, description, steps, tip, image }: GuidedRoutineProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const progressPercent = Math.round((completedSteps.length / steps.length) * 100)

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <div className="space-y-4">
      <img src={image || "/placeholder.svg"} alt={title} className="h-36 w-full rounded-lg object-cover border border-primary/20" />
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
        <h4 className="font-medium text-sm">{title} Steps</h4>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isDone = completedSteps.includes(index)
            return (
              <button
                key={step}
                type="button"
                onClick={() => toggleStep(index)}
                className={`w-full text-left text-sm rounded-md border px-3 py-2 transition-colors ${
                  isDone ? "bg-primary/10 border-primary/40 line-through text-muted-foreground" : "bg-background border-border"
                }`}
              >
                {index + 1}. {step}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Tip:</span> {tip}
      </p>
    </div>
  )
}

function GratitudeJournal({ userId }: { userId: string }) {
  const [entry, setEntry] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [savedEntries, setSavedEntries] = useState<Array<{ id: string; content: string; created_at: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadEntries = async () => {
    const { data, error: loadError } = await supabase
      .from("gratitude_entries")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!loadError && data) {
      setSavedEntries(data)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const handleSave = async () => {
    if (!entry.trim()) return
    setError(null)
    setIsSaving(true)

    const { error: insertError } = await supabase.from("gratitude_entries").insert({
      user_id: userId,
      content: entry.trim(),
    })

    if (insertError) {
      setError(insertError.message)
      setIsSaving(false)
      return
    }

    setEntry("")
    setIsSaving(false)
    loadEntries()
  }

  return (
    <div className="space-y-4">
      <img
        src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
        alt="Gratitude journal"
        className="h-36 w-full rounded-lg object-cover border border-primary/20"
      />
      <p className="text-sm text-muted-foreground">
        Write a few things you are grateful for today. Your notes are saved and visible on your dashboard.
      </p>
      <div className="space-y-2">
        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows={5}
          placeholder="Today I am grateful for..."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleSave} disabled={isSaving || !entry.trim()} className="w-full">
          {isSaving ? "Saving..." : "Save Gratitude Entry"}
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Recent Entries</h4>
        {savedEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet. Start by writing your first one.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {savedEntries.map((saved) => (
              <div key={saved.id} className="rounded-md border p-3 bg-muted/30">
                <p className="text-sm">{saved.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(saved.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const games = [
  {
    id: "breathing",
    title: "Breathing Patterns",
    description: "Follow calming breathing exercises with visual guidance",
    icon: Wind,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    duration: "5 mins",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "garden",
    title: "Zen Garden",
    description: "Create and maintain your digital peaceful space",
    icon: Flower2,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    duration: "10 mins",
    image: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "forest",
    title: "Mindful Forest",
    description: "Take a peaceful walk through a virtual forest",
    icon: TreePine,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    duration: "15 mins",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "waves",
    title: "Ocean Waves",
    description: "Match your breath with gentle ocean waves",
    icon: Waves,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    duration: "8 mins",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "memory-map",
    title: "Memory Map",
    description: "Improve focus and memory by matching pairs of icons",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    duration: "5 mins",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "yoga-flow",
    title: "Gentle Yoga Flow",
    description: "Simple anxiety-relief yoga poses you can do at home",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    duration: "10 mins",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "desk-stretch",
    title: "Desk Stretch Break",
    description: "Release neck, shoulder, and back tension in a few minutes",
    icon: Dumbbell,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    duration: "7 mins",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    description: "Reset racing thoughts with sensory grounding",
    icon: Brain,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    duration: "5 mins",
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gratitude-journal",
    title: "Gratitude Journal",
    description: "Shift focus toward supportive and positive moments",
    icon: NotebookPen,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    duration: "6 mins",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "body-scan",
    title: "Body Scan Relaxation",
    description: "Calm your nervous system by scanning from head to toe",
    icon: Wind,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    duration: "8 mins",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
]

interface AnxietyGamesProps {
  userId: string
  onGamePlayed?: (gameName: string, description: string) => Promise<void>
}

export const AnxietyGames = ({ userId, onGamePlayed }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [showGame, setShowGame] = useState(false)

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId)
    setShowGame(true)

    // Log the activity
    if (onGamePlayed) {
      try {
        await onGamePlayed(gameId, games.find((g) => g.id === gameId)?.description || "")
      } catch (error) {
        console.error("Error logging game activity:", error)
      }
    }
  }

  const renderGame = () => {
    switch (selectedGame) {
      case "breathing":
        return <BreathingGame />
      case "garden":
        return <ZenGarden />
      case "forest":
        return <ForestGame />
      case "waves":
        return <OceanWaves />
      case "memory-map":
        return <MemoryMap />
      case "yoga-flow":
        return (
          <GuidedRoutine
            title="Gentle Yoga Flow"
            description="Move slowly and stay within your comfort range. Focus on smooth breathing."
            steps={[
              "Mountain pose (1 min): stand tall, shoulders soft, steady breaths.",
              "Forward fold (1 min): relax neck and let your upper body hang.",
              "Cat-cow (2 mins): on hands/knees, alternate spine rounding and arching.",
              "Child's pose (2 mins): rest hips back and breathe into your lower back.",
              "Seated twist (2 mins): gentle twist each side to release tension.",
              "Legs-up-the-wall or resting pose (2 mins): finish with calm breaths.",
            ]}
            tip="If any pose feels uncomfortable, skip it and continue with breathing."
            image={games.find((g) => g.id === "yoga-flow")?.image || "/placeholder.svg"}
          />
        )
      case "desk-stretch":
        return (
          <GuidedRoutine
            title="Desk Stretch Break"
            description="Great for study/work sessions when anxiety builds as body tension."
            steps={[
              "Neck stretch: tilt ear to shoulder, hold 20s each side.",
              "Shoulder rolls: 10 forward + 10 backward.",
              "Chest opener: clasp hands behind back, gently lift for 30s.",
              "Seated spinal twist: hold 20s each side.",
              "Wrist and forearm stretch: hold 20s each side.",
              "Stand and shake out your body with 5 slow breaths.",
            ]}
            tip="Pair this with a glass of water to reset both body and mind."
            image={games.find((g) => g.id === "desk-stretch")?.image || "/placeholder.svg"}
          />
        )
      case "grounding-54321":
        return (
          <GuidedRoutine
            title="5-4-3-2-1 Grounding"
            description="Use your senses to return to the present moment."
            steps={[
              "Name 5 things you can see.",
              "Name 4 things you can feel (touch/texture).",
              "Name 3 things you can hear.",
              "Name 2 things you can smell.",
              "Name 1 thing you can taste or are grateful for.",
              "Take 3 slow breaths and notice your body again.",
            ]}
            tip="Say each item out loud for a stronger grounding effect."
            image={games.find((g) => g.id === "grounding-54321")?.image || "/placeholder.svg"}
          />
        )
      case "gratitude-journal":
        return <GratitudeJournal userId={userId} />
      case "body-scan":
        return (
          <GuidedRoutine
            title="Body Scan Relaxation"
            description="Release stored stress by gently observing each part of your body."
            steps={[
              "Close eyes and take 5 slow breaths.",
              "Notice forehead, jaw, and shoulders. Soften each area.",
              "Scan chest and belly. Let your breathing slow naturally.",
              "Scan arms and hands. Unclench fingers.",
              "Scan hips, legs, and feet. Feel heaviness and support below you.",
              "Finish with one deep inhale and a long exhale.",
            ]}
            tip="If your mind wanders, that's okay; gently bring attention back to the body."
            image={games.find((g) => g.id === "body-scan")?.image || "/placeholder.svg"}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Anxiety Relief Activities
          </CardTitle>
          <CardDescription>Interactive exercises to help reduce stress and anxiety</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <motion.div key={game.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer ${
                    selectedGame === game.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleGameStart(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${game.bgColor} ${game.color}`}>
                        <game.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{game.title}</h4>
                        <img
                          src={game.image || "/placeholder.svg"}
                          alt={game.title}
                          className="w-full h-24 object-cover rounded-md mt-2 border border-primary/10"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{game.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedGame && (
            <div className="mt-6 text-center">
              <Button className="gap-2" onClick={() => setSelectedGame(null)}>
                <Gamepad2 className="h-4 w-4" />
                Start {games.find((g) => g.id === selectedGame)?.title}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{games.find((g) => g.id === selectedGame)?.title}</DialogTitle>
          </DialogHeader>
          {renderGame()}
        </DialogContent>
      </Dialog>
    </>
  )
}

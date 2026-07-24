"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Sparkles, Save, Printer, Heart, Smile, Meh, Frown, AlertCircle, Calendar, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { FormattedMessage } from "@/components/formatted-message"

interface JournalEntry {
  id: string
  date: string
  mood: number
  text: string
  aiReflection?: string
}

const MOODS = [
  { value: 1, label: "Overwhelmed", emoji: "😫", color: "text-red-500 bg-red-500/10 border-red-500/30" },
  { value: 2, label: "Down", emoji: "😔", color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  { value: 3, label: "Neutral", emoji: "😐", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { value: 4, label: "Peaceful", emoji: "😊", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { value: 5, label: "Grateful", emoji: "🌟", color: "text-primary bg-primary/10 border-primary/30" },
]

const PROMPT_IDEAS = [
  "What is something small that brought you peace today?",
  "What are 3 things you are deeply thankful for right now?",
  "How did you practice kindness or self-compassion today?",
  "What is a challenge you faced, and how did you handle it?",
]

export function JournalPage() {
  const [mood, setMood] = useState<number>(4)
  const [entryText, setEntryText] = useState("")
  const [aiReflection, setAiReflection] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("sukoon_journal_entries")
    if (stored) {
      try {
        setSavedEntries(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  const saveToStorage = (entries: JournalEntry[]) => {
    setSavedEntries(entries)
    localStorage.setItem("sukoon_journal_entries", JSON.stringify(entries))
  }

  const handleGetAIReflection = async () => {
    if (!entryText.trim() || isGenerating) return
    setIsGenerating(true)

    try {
      const prompt = `Below is a user's daily gratitude and mindfulness journal entry (Mood rating: ${mood}/5):\n\n"${entryText.trim()}"\n\nAs Dr. Emily Hartman, a compassionate clinical psychologist, provide a warm, 2-3 paragraph supportive reflection highlighting their positive mindset, gentle coping encouragement, and a brief grounding tip.`

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiReflection(data.response || "Thank you for reflecting today. Keep taking tender care of yourself.")
      } else {
        setAiReflection("Thank you for sharing your thoughts today. Taking time to journal is a wonderful act of self-care.")
      }
    } catch (e) {
      setAiReflection("Thank you for sharing your thoughts today. Taking time to journal is a wonderful act of self-care.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveEntry = () => {
    if (!entryText.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      mood,
      text: entryText.trim(),
      aiReflection: aiReflection || undefined,
    }

    const updated = [newEntry, ...savedEntries]
    saveToStorage(updated)
    setEntryText("")
    setAiReflection(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <BookOpen className="h-4 w-4" /> Daily Mindfulness Journal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Express Your Thoughts & Gratitude
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Write down your reflections and receive encouraging, therapeutic feedback from Dr. Emily Hartman.
          </p>
        </div>

        {/* Journal Form Card */}
        <Card className="border-border bg-card shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Mood Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                How are you feeling right now?
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {MOODS.map((m) => {
                  const isSelected = mood === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(m.value)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? `${m.color} ring-2 ring-primary shadow-md font-bold scale-105`
                          : "bg-muted/40 hover:bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[11px] hidden sm:inline">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Prompt Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prompt Inspiration (Click to append)
              </span>
              <div className="flex flex-wrap gap-2">
                {PROMPT_IDEAS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEntryText((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `))}
                    className="text-xs bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/80 text-foreground px-3 py-1.5 rounded-xl transition-all"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write your entry here... Reflect on what you experienced, felt, or appreciate today..."
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                className="min-h-[160px] text-sm p-4 rounded-2xl bg-background border-border resize-none leading-relaxed shadow-inner"
              />
            </div>

            {/* AI Reflection Output */}
            {aiReflection && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-2"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> Dr. Emily Hartman's Reflection
                </div>
                <div className="text-sm leading-relaxed text-foreground">
                  <FormattedMessage content={aiReflection} isUser={false} />
                </div>
              </motion.div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetAIReflection}
                disabled={!entryText.trim() || isGenerating}
                className="gap-2 text-xs h-10 px-4 rounded-xl border-primary/40 hover:bg-primary/10 text-primary font-semibold"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                {isGenerating ? "Dr. Emily is reflecting..." : "Get Dr. Emily's Reflection"}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs h-10 px-3 rounded-xl border-border"
                  title="Print Journal Entry"
                >
                  <Printer className="h-4 w-4" /> Export PDF
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={!entryText.trim()}
                  className="gap-2 text-xs h-10 px-5 rounded-xl shadow-md"
                >
                  <Save className="h-4 w-4" /> Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Section */}
        {savedEntries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Journal History ({savedEntries.length})
            </h2>

            <div className="space-y-4">
              {savedEntries.map((entry) => {
                const moodObj = MOODS.find((m) => m.value === entry.mood) || MOODS[2]
                return (
                  <Card key={entry.id} className="border-border bg-card/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xs">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{moodObj.emoji}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted border border-border">
                            {moodObj.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{entry.date}</span>
                      </div>

                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {entry.text}
                      </p>

                      {entry.aiReflection && (
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground space-y-1">
                          <span className="font-bold text-primary flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Dr. Emily's Note
                          </span>
                          <p className="text-muted-foreground">{entry.aiReflection}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}

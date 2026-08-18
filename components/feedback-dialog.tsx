"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquarePlus, Star, Send, CheckCircle2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/client"
import { ConfettiBurst } from "@/components/confetti-burst"

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [category, setCategory] = useState<"bug" | "feature" | "experience" | "general">("experience")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Attempt to save feedback to feedback table
      await supabase.from("feedback").insert({
        user_id: user?.id || null,
        rating,
        category,
        message: message.trim(),
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      console.log("Feedback logged:", { rating, category, message })
    } finally {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setShowConfetti(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setMessage("")
        setIsOpen(false)
      }, 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
          <MessageSquarePlus className="w-3.5 h-3.5 text-primary" /> Share Feedback
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-primary/20 rounded-3xl">
        <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-primary" /> Share Your Thoughts
          </DialogTitle>
          <DialogDescription>Help us make SukoonAI better for everyone during public launch.</DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Thank You!</h3>
            <p className="text-xs text-muted-foreground">Your feedback has been received and helps shape the future of SukoonAI.</p>
          </motion.div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Rating Stars */}
            <div className="space-y-1 text-center">
              <p className="text-xs font-bold text-muted-foreground">Overall Platform Rating</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "experience", label: "✨ Experience" },
                  { id: "feature", label: "💡 Feature Idea" },
                  { id: "bug", label: "🐛 Bug Report" },
                  { id: "general", label: "💬 General" },
                ].map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={category === cat.id ? "default" : "outline"}
                    onClick={() => setCategory(cat.id as any)}
                    className={`cursor-pointer py-1.5 px-3 rounded-xl font-bold text-xs transition-all ${
                      category === cat.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/30 border-border/50 hover:bg-muted/60"
                    }`}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground">Your Feedback</p>
              <Textarea
                placeholder="What did you love or what can we improve?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] rounded-2xl border-primary/20 focus:border-primary text-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold rounded-xl text-xs px-5 shadow-md shadow-primary/20 gap-2"
              >
                {isSubmitting ? "Sending..." : "Submit Feedback"} <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

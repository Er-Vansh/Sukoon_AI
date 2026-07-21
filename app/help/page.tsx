"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search, Brain, MessageSquare, Users, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const faqs = [
  {
    category: "general",
    question: "What is SukoonAI?",
    answer: "SukoonAI is an integrated mental wellness companion platform. We combine 24/7 empathetic AI therapy support with a marketplace of licensed professional counsellors whom you can browse, request consultations, and attend video sessions with.",
  },
  {
    category: "ai-chat",
    question: "How does the AI Companion work?",
    answer: "Dr. Emily Hartman, our AI companion, is a warm and experienced digital psychologist. She uses advanced language models trained on therapeutic guidance to chat with you, listen to your concerns, normalize your feelings, and suggest wellness activities. If you are not logged in, you can try 3 free trial messages before signing up.",
  },
  {
    category: "privacy",
    question: "Is my chat history private and secure?",
    answer: "Absolutely. Privacy is our top priority. All chat sessions, messages, and counsellor requests are securely encrypted. We do not sell or share your conversational records with third parties. Anonymous trial chats are held entirely in-memory and are not logged.",
  },
  {
    category: "counselling",
    question: "How do I book an appointment with a counsellor?",
    answer: "First, sign up or log in as a Patient. Go to 'Find Counsellors' to browse profiles, credentials, ratings, and specializations. Click 'View Profile & Book' on any counsellor card, complete the consultation form with your concerns and preferred date, and submit. The counsellor will review and schedule your session with a meeting link.",
  },
  {
    category: "general",
    question: "Is SukoonAI a replacement for clinical therapy?",
    answer: "No. Our AI companion provides immediate emotional attunement, grounding exercises, and wellness games, but it is not a medical device or a replacement for clinical therapy. If you are in immediate danger or self-harm crisis, please use our red Emergency SOS button to access safety hotlines.",
  },
  {
    category: "counselling",
    question: "How do counsellors manage requests?",
    answer: "Counsellors have access to a dedicated Counsellor Dashboard. They can view incoming consultation requests, accept them by specifying a scheduled date, duration, platform (like Zoom or Google Meet), meeting link, and notes. The patient receives a notification and can join directly from their dashboard.",
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState("")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Help Center</h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Find answers to common questions about using our AI companion, booking consultations, and privacy settings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Input
            placeholder="Search help articles..."
            className="pl-11 pr-4 py-6 text-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Features Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
              </div>
              <h3 className="font-bold text-sm">AI Companion</h3>
              <p className="text-xs text-muted-foreground">
                Learn how to interact with Dr. Emily Hartman and use wellness activities.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal-500" />
              </div>
              <h3 className="font-bold text-sm">Counselling</h3>
              <p className="text-xs text-muted-foreground">
                Read about browsing counsellors, booking, and joining video appointments.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-sm">Privacy & Trial</h3>
              <p className="text-xs text-muted-foreground">
                Understand security, RLS policies, and our 3-message free anonymous trial.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <Card key={index} className="border border-border bg-card/40 backdrop-blur-xs overflow-hidden">
                  <button
                    className="w-full text-left p-5 flex justify-between items-center hover:bg-muted/30 transition-colors"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="font-semibold text-sm md:text-base text-foreground">{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border p-5 bg-muted/10 text-xs md:text-sm text-muted-foreground leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No FAQ articles found matching "{search}"</p>
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

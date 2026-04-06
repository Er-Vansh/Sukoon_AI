"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/client"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm here to provide emotional support and listen to whatever's on your mind. How are you feeling today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const createSession = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          mood: "neutral",
        })
        .select()
        .single()

      if (!error && data) {
        setSessionId(data.id)
      }
    }

    createSession()
  }, [userId])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage.content,
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const aiResponses = [
        "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what's been on your mind?",
        "Thank you for sharing that with me. It takes courage to open up. How has this been affecting your daily life?",
        "I understand this must be difficult for you. What kind of support do you feel you need right now?",
        "That's a challenging situation. Have you noticed any patterns in how you're feeling?",
        "I appreciate your honesty. Remember, it's okay to not be okay sometimes. What helps you feel better when you're going through tough times?",
      ]

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      }

      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: aiMessage.content,
      })

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Therapy Chat</h1>
                <p className="text-xs text-muted-foreground">Your safe space to talk</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border-border"
                  }`}
                >
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This AI companion provides emotional support but is not a replacement for professional therapy.
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, X, Loader2, RefreshCw, MessageSquare, LogIn } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/client"
import { FormattedMessage } from "@/components/formatted-message"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const TRIAL_LIMIT = 3

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "📌 **Welcome to SukoonAI**\nHello and welcome! I'm Dr. Emily Hartman, a clinical psychologist here to listen and support you.\n\n🔹 **Key Guidance & Concepts**\n- **A Safe Space**: You're in a safe and non-judgmental space to explore your thoughts and feelings.\n- **Active Listening**: I'll listen attentively to what you share, and respond with empathy.\n- **Your Journey**: Our conversation is about your journey, and we'll navigate it together at your pace.\n\n💡 **Practical Action / Tip**\nTake a deep breath in, and as you exhale, allow yourself to settle into this moment, feeling calm and supported.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [anonMsgCount, setAnonMsgCount] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, isOpen])

  // Listen for global custom event to open the chat widget
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-ai-chat", handleOpen)
    return () => window.removeEventListener("open-ai-chat", handleOpen)
  }, [])

  // Load user session and state
  useEffect(() => {
    const loadSession = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        
        // Load or create Supabase session
        const { data: existingSession } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (existingSession && existingSession.length > 0) {
          const sId = existingSession[0].id
          setSessionId(sId)
          
          // Load past messages
          const { data: pastMessages } = await supabase
            .from("chat_messages")
            .select("role, content")
            .eq("session_id", sId)
            .order("created_at", { ascending: true })

          if (pastMessages && pastMessages.length > 0) {
            setMessages(pastMessages.map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })))
          }
        } else {
          // Insert a new session
          const { data: newSession } = await supabase
            .from("chat_sessions")
            .insert({ user_id: user.id, mood: "neutral" })
            .select()
            .single()

          if (newSession) {
            setSessionId(newSession.id)
          }
        }
      } else {
        // Load trial message count from localStorage for anonymous users
        const storedCount = localStorage.getItem("sukoon_anon_chat_count")
        if (storedCount) {
          const count = parseInt(storedCount, 10)
          setAnonMsgCount(count)
          if (count >= TRIAL_LIMIT) {
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content: "You have reached your limit of 3 free trial messages. Please log in or sign up to save your history and continue chatting.",
              },
            ])
          }
        }
      }
    }

    loadSession()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // If anonymous and reached trial limit, block send
    if (!userId && anonMsgCount >= TRIAL_LIMIT) return

    const userMessageText = input.trim()
    const userMessage: Message = { role: "user", content: userMessageText }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      // If logged in, save user message to database
      if (userId && sessionId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "user",
          content: userMessageText,
        })
      }

      // Fetch AI response from local Python backend
      const backendUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "http://localhost:8000"
      const res = await fetch(`${backendUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessageText }),
      })

      if (!res.ok) {
        throw new Error(`AI agent backend returned an error: ${res.statusText}`)
      }

      const data = await res.json()
      const aiResponseContent = data.response

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponseContent || "I'm here to support you, but I couldn't generate a response just now.",
      }

      // If logged in, save assistant message to database
      if (userId && sessionId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: aiMessage.content,
        })
      } else {
        // Increment anonymous trial counter
        const nextCount = anonMsgCount + 1
        setAnonMsgCount(nextCount)
        localStorage.setItem("sukoon_anon_chat_count", nextCount.toString())

        if (nextCount >= TRIAL_LIMIT) {
          setMessages((prev) => [
            ...prev,
            aiMessage,
            {
              role: "system",
              content: "You have reached your limit of 3 free trial messages. Please log in or sign up to save your history and continue chatting.",
            },
          ])
          setIsLoading(false)
          return
        }
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message to AI agent:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting to my service right now. Please make sure the AI-agent server is running on http://localhost:8000.",
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const resetChat = async () => {
    if (userId) {
      const supabase = createClient()
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({ user_id: userId, mood: "neutral" })
        .select()
        .single()

      if (newSession) {
        setSessionId(newSession.id)
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm Dr. Emily Hartman, your AI therapy companion. How are you feeling today?",
          },
        ])
      }
    } else {
      localStorage.removeItem("sukoon_anon_chat_count")
      setAnonMsgCount(0)
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm Dr. Emily Hartman, your AI therapy companion. How are you feeling today?",
        },
      ])
    }
  }

  const isTrialExceeded = !userId && anonMsgCount >= TRIAL_LIMIT

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-24 z-50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 border-4 border-background"
          >
            {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
          </Button>
        </motion.div>
      </div>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-md flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Dr. Emily Hartman</h4>
                  <p className="text-[10px] text-muted-foreground">AI Therapy Companion</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={resetChat} title="Reset Chat">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/50">
              {messages.map((message, index) => {
                if (message.role === "system") {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-2"
                    >
                      <p className="text-xs text-destructive font-medium">{message.content}</p>
                      <div className="flex justify-center gap-2">
                        <Link href="/auth/login" passHref>
                          <Button size="sm" className="h-7 text-[10px] gap-1 px-3">
                            <LogIn className="h-3 w-3" /> Log In
                          </Button>
                        </Link>
                        <Link href="/auth/sign-up" passHref>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] px-3 bg-transparent">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )
                }

                const isUser = message.role === "user"
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <Card
                      className={`max-w-[85%] rounded-2xl ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/50 border-border text-foreground rounded-tl-none"
                      }`}
                    >
                      <CardContent className="p-3">
                        <FormattedMessage content={message.content} isUser={isUser} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
              {isLoading && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
                  <Card className="bg-muted/50 border-border rounded-2xl rounded-tl-none max-w-[85%]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input / Control Footer */}
            <div className="p-3 border-t border-border bg-muted/20">
              {isTrialExceeded ? (
                <div className="text-center py-2 space-y-2">
                  <p className="text-[11px] text-muted-foreground">Log in to save history and keep talking</p>
                  <Link href="/auth/login" passHref className="block w-full">
                    <Button className="w-full gap-2 text-xs h-9">
                      <LogIn className="h-4 w-4" /> Sign In to Continue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-1.5 items-end">
                  <Textarea
                    placeholder={
                      !userId
                        ? `Trial: ${anonMsgCount}/${TRIAL_LIMIT} messages...`
                        : "Type your message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[40px] max-h-[100px] h-[40px] resize-none text-xs rounded-xl py-2 px-3 flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-[9px] text-muted-foreground text-center mt-2">
                AI support is not a replacement for professional therapy.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

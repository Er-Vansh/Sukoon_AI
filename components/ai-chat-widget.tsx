"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, X, Loader2, RefreshCw, MessageSquare, LogIn, Maximize2, Minimize2, Sparkles, GripHorizontal } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/client"
import { FormattedMessage } from "@/components/formatted-message"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const TRIAL_LIMIT = 3

const SUGGESTED_PROMPTS = [
  "I'm feeling anxious today",
  "Help me practice a quick mindfulness exercise",
  "I need tips to deal with stress",
  "How can I sleep better tonight?",
]

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const dragControls = useDragControls()
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
  }, [messages, isOpen, isMinimized])

  // Listen for global custom event to open the chat widget in full page view
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }
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

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim()
    if (!textToSend || isLoading) return

    // If anonymous and reached trial limit, block send
    if (!userId && anonMsgCount >= TRIAL_LIMIT) return

    const userMessage: Message = { role: "user", content: textToSend }
    
    setMessages((prev) => [...prev, userMessage])
    if (!customMessage) setInput("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      // If logged in, save user message to database
      if (userId && sessionId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "user",
          content: textToSend,
        })
      }

      // Fetch AI response from AI agent (custom server or internal Next.js API route)
      const backendUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL
      const primaryUrl = backendUrl ? `${backendUrl}/ask` : "/api/chat"

      let res: Response | null = null
      try {
        res = await fetch(primaryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend }),
        })
      } catch (e) {
        console.warn("Primary endpoint failed, falling back to /api/chat", e)
      }

      // Fallback to internal Next.js API route if primary fetch failed
      if (!res || !res.ok) {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend }),
        })
      }

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
        content: "I'm experiencing a temporary connection issue. Please try sending your message again.",
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

  const toggleTrigger = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else {
      setIsOpen(false)
    }
  }

  const isTrialExceeded = !userId && anonMsgCount >= TRIAL_LIMIT

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Button
            onClick={toggleTrigger}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 border-2 border-background"
            title={isOpen ? "Close Chat" : "Open Dr. Emily Hartman AI Therapy"}
          >
            {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
          </Button>
        </motion.div>
      </div>

      {/* Chat Window: Full Page Overlay or Minimized Floating Box */}
      <AnimatePresence>
        {isOpen && (
          isMinimized ? (
            /* --- MINIMIZED VIEW (Draggable Floating Corner Widget) --- */
            <motion.div
              key="minimized-view"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={false}
              dragElastic={0.05}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-md flex flex-col z-50 overflow-hidden"
            >
              {/* Minimized Header with Drag Controls */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between cursor-grab active:cursor-grabbing select-none touch-none"
                title="Click and drag header to move window"
              >
                <div className="flex items-center gap-2">
                  <GripHorizontal className="h-4 w-4 text-muted-foreground/70 mr-0.5" />
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">Dr. Emily Hartman</h4>
                    <p className="text-[10px] text-muted-foreground">AI Therapy Companion</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMinimized(false)}
                    title="Expand to Full Page View"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={resetChat}
                    title="Reset Chat"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Minimized Message Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-background/50">
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

              {/* Minimized Footer */}
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
                      onClick={() => handleSend()}
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
          ) : (
            /* --- FULL-PAGE LARGE VIEW (Default) --- */
            <motion.div
              key="fullpage-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden"
            >
              {/* Full-Page Header */}
              <header className="border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-foreground">Dr. Emily Hartman</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 hidden sm:inline-block">
                        AI Therapy Companion
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Always active • Safe, confidential & empathetic support</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="gap-1.5 text-xs h-9 px-3 rounded-xl border-border hover:bg-muted font-medium"
                    title="Minimize View"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Minimize View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetChat}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Reset Session"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Close Chat"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              {/* Full-Page Content & Chat Stream */}
              <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 sm:p-6 overflow-hidden">
                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {messages.map((message, index) => {
                    if (message.role === "system") {
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3 max-w-md mx-auto my-4"
                        >
                          <p className="text-sm text-destructive font-medium">{message.content}</p>
                          <div className="flex justify-center gap-3">
                            <Link href="/auth/login" passHref>
                              <Button size="sm" className="gap-1.5 px-4">
                                <LogIn className="h-4 w-4" /> Log In
                              </Button>
                            </Link>
                            <Link href="/auth/sign-up" passHref>
                              <Button size="sm" variant="outline" className="px-4 bg-transparent">
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <Card
                          className={`max-w-[85%] sm:max-w-[80%] rounded-2xl shadow-sm ${
                            isUser
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-card border-border text-foreground rounded-tl-none"
                          }`}
                        >
                          <CardContent className="p-4 sm:p-5">
                            <FormattedMessage content={message.content} isUser={isUser} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}

                  {/* Suggested Conversation Starters */}
                  {messages.length <= 2 && !isLoading && !isTrialExceeded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4 pb-2"
                    >
                      <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Suggested topics to get started:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SUGGESTED_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="text-xs text-left bg-card hover:bg-primary/10 hover:border-primary/40 border border-border/80 text-foreground px-4 py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-between group"
                          >
                            <span>{prompt}</span>
                            <Send className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <Card className="bg-card border-border rounded-2xl rounded-tl-none max-w-[80%]">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Dr. Emily Hartman is typing...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Full-Page Input Area */}
                <div className="pt-4 border-t border-border/80">
                  {isTrialExceeded ? (
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border text-center space-y-3 max-w-lg mx-auto">
                      <p className="text-sm text-muted-foreground">Log in to save history and keep chatting with Dr. Emily Hartman.</p>
                      <div className="flex justify-center gap-3">
                        <Link href="/auth/login" passHref>
                          <Button className="gap-2 px-5">
                            <LogIn className="h-4 w-4" /> Sign In to Continue
                          </Button>
                        </Link>
                        <Link href="/auth/sign-up" passHref>
                          <Button variant="outline" className="px-5">Sign Up</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-end">
                      <Textarea
                        placeholder={
                          !userId
                            ? `Trial: ${anonMsgCount}/${TRIAL_LIMIT} messages... Ask anything on your mind...`
                            : "Type your message... (Press Enter to send, Shift+Enter for newline)"
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[56px] max-h-[140px] h-[56px] resize-none text-sm rounded-2xl py-3.5 px-4 flex-1 bg-card border-border focus-visible:ring-primary shadow-sm"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-[56px] w-[56px] rounded-2xl shrink-0 shadow-md bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                    SukoonAI provides compassionate support for mental wellness. It is not a replacement for clinical emergency services.
                  </p>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  )
}


"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, PhoneOff, AlertCircle, FileText, Wind, ChevronRight, ChevronLeft, Copy, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export function CounselorVideoRoom({ roomId, userId }: { roomId: string; userId: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [notes, setNotes] = useState("")
  const [copied, setCopied] = useState(false)

  // Live session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyNotes = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const triggerSOS = () => {
    window.dispatchEvent(new CustomEvent("open-emergency-sos"))
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-semibold text-foreground">Counseling Consultation Room</h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[11px] text-muted-foreground border border-border">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-mono text-foreground border border-border">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* SOS Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSOS}
            className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SOS Support</span>
          </Button>

          {/* Toggle Side Toolkit */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Toggle In-Call Notes & Toolkit"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Toolkit</span>
          </Button>

          {/* End Call */}
          <Link href="/dashboard">
            <Button size="sm" variant="destructive" className="gap-1.5 text-xs px-3 sm:px-4">
              <PhoneOff className="h-4 w-4" />
              <span>Leave Call</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Split Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Area */}
        <div className="flex-1 bg-black relative flex flex-col">
          <iframe
            src={`https://meet.jit.si/SukoonAI-${roomId}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
          />
        </div>

        {/* Collapsible Sidebar: Notes & Grounding */}
        {isSidebarOpen && (
          <aside className="w-80 sm:w-96 border-l border-border bg-card flex flex-col shadow-xl z-10 transition-all duration-200">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">In-Call Clinical Toolkit</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsSidebarOpen(false)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="notes" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-2 m-3 mb-0">
                <TabsTrigger value="notes" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Session Notes
                </TabsTrigger>
                <TabsTrigger value="grounding" className="text-xs gap-1.5">
                  <Wind className="h-3.5 w-3.5" /> Grounding
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Notes */}
              <TabsContent value="notes" className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
                <p className="text-[11px] text-muted-foreground">
                  Private session notepad. Notes stay in your browser and are not shared.
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type session takeaways, insights, or action steps here..."
                  className="flex-1 resize-none text-xs leading-relaxed p-3 rounded-xl bg-background border-border"
                />
                <Button variant="outline" size="sm" onClick={copyNotes} className="w-full gap-1.5 text-xs h-8">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied to Clipboard" : "Copy Notes"}
                </Button>
              </TabsContent>

              {/* Tab 2: Grounding Toolkit */}
              <TabsContent value="grounding" className="flex-1 p-3 overflow-y-auto space-y-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Wind className="h-4 w-4" /> 5-4-3-2-1 Grounding Method
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Use this exercise if you feel anxious or overwhelmed during the session:
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-bold text-primary">5</span> Things you can <span className="font-semibold">SEE</span> around you
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-bold text-primary">4</span> Things you can physically <span className="font-semibold">TOUCH</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-bold text-primary">3</span> Things you can <span className="font-semibold">HEAR</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-bold text-primary">2</span> Things you can <span className="font-semibold">SMELL</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-bold text-primary">1</span> Thing you can <span className="font-semibold">TASTE</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
                  <p className="text-[11px] font-medium text-destructive">Need immediate crisis help?</p>
                  <Button size="sm" variant="destructive" onClick={triggerSOS} className="w-full text-xs h-7">
                    Open Emergency Helplines
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}

        {!isSidebarOpen && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 right-4 z-20 shadow-md rounded-full"
            title="Open In-Call Toolkit"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

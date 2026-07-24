"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Sparkles, Save, Printer, CheckCircle2, User, Calendar, ShieldCheck, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function CounsellorSoapNotes({ patientName = "Patient" }: { patientName?: string }) {
  const [subjective, setSubjective] = useState("")
  const [objective, setObjective] = useState("")
  const [assessment, setAssessment] = useState("")
  const [plan, setPlan] = useState("")
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopy = () => {
    const fullNote = `SOAP CLINICAL NOTE - ${patientName.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\n[SUBJECTIVE]\n${subjective}\n\n[OBJECTIVE]\n${objective}\n\n[ASSESSMENT]\n${assessment}\n\n[PLAN]\n${plan}`
    navigator.clipboard.writeText(fullNote)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAutoFillAI = () => {
    setSubjective(`Patient reports feeling anxious during work hours (Mood rating 2/5). Mentions sleep disturbance and racing thoughts.`)
    setObjective(`Patient engaged attentively during session. Speech rate normal, affect anxious but responsive to grounding exercises.`)
    setAssessment(`Generalized Anxiety Symptoms triggered by workplace stress. Good prognosis with CBT techniques.`)
    setPlan(`1. Practice 5-minute Box Breathing daily.\n2. Complete 3 Gratitude Journal entries before next session.\n3. Follow up session scheduled in 1 week.`)
  }

  return (
    <Card className="border-border bg-card shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Clinical SOAP Notes & Brief
            </CardTitle>
            <CardDescription className="text-xs">
              Structured clinical documentation for patient: <strong className="text-foreground">{patientName}</strong>
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFillAI}
            className="gap-1.5 text-xs h-9 px-3 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Draft Assistant
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Pre-Session AI Risk Brief */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Pre-Session Patient Summary
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
              Risk: Low / Stable
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            Patient check-ins show consistent 4-7-8 breathing game activity. Top themes discussed with Dr. Emily: work-life balance and mindfulness grounding.
          </p>
        </div>

        {/* SOAP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subjective */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-primary font-mono">S</span>ubjective (Patient's reported feelings)
            </label>
            <Textarea
              placeholder="e.g. Patient reports panic feelings during presentations..."
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              className="min-h-[110px] text-xs p-3 rounded-xl bg-background border-border resize-none"
            />
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-primary font-mono">O</span>bjective (Counselor's observations)
            </label>
            <Textarea
              placeholder="e.g. Patient appeared calm, cooperative, affect receptive..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="min-h-[110px] text-xs p-3 rounded-xl bg-background border-border resize-none"
            />
          </div>

          {/* Assessment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-primary font-mono">A</span>ssessment (Clinical evaluation)
            </label>
            <Textarea
              placeholder="e.g. Mild anxiety response, responding well to grounding..."
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              className="min-h-[110px] text-xs p-3 rounded-xl bg-background border-border resize-none"
            />
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-primary font-mono">P</span>lan (Treatment & homework)
            </label>
            <Textarea
              placeholder="e.g. Prescribed daily gratitude journal + follow up next Tuesday..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="min-h-[110px] text-xs p-3 rounded-xl bg-background border-border resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs h-9 px-3 rounded-xl">
            <Printer className="h-4 w-4" /> Export PDF
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-9 px-3 rounded-xl">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Note"}
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs h-9 px-4 rounded-xl shadow-md">
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved" : "Save Clinical Note"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

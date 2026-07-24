"use client"

import { useState } from "react"
import { Activity, ClipboardList, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
]

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things, such as reading or TV",
  "Moving or speaking so slowly that other people noticed",
  "Thoughts that you would be better off dead or hurting yourself",
]

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half days", value: 2 },
  { label: "Nearly every day", value: 3 },
]

export function ClinicalAssessments() {
  const [gadScores, setGadScores] = useState<number[]>(Array(7).fill(0))
  const [phqScores, setPhqScores] = useState<number[]>(Array(9).fill(0))
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  const gadTotal = gadScores.reduce((a, b) => a + b, 0)
  const phqTotal = phqScores.reduce((a, b) => a + b, 0)

  const getGadSeverity = (score: number) => {
    if (score <= 4) return { label: "Minimal Anxiety", color: "text-green-600 bg-green-500/10 border-green-500/20" }
    if (score <= 9) return { label: "Mild Anxiety", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" }
    if (score <= 14) return { label: "Moderate Anxiety", color: "text-orange-600 bg-orange-500/10 border-orange-500/20" }
    return { label: "Severe Anxiety", color: "text-red-600 bg-red-500/10 border-red-500/20" }
  }

  const getPhqSeverity = (score: number) => {
    if (score <= 4) return { label: "Minimal Depression", color: "text-green-600 bg-green-500/10 border-green-500/20" }
    if (score <= 9) return { label: "Mild Depression", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" }
    if (score <= 14) return { label: "Moderate Depression", color: "text-orange-600 bg-orange-500/10 border-orange-500/20" }
    if (score <= 19) return { label: "Moderately Severe", color: "text-red-600 bg-red-500/10 border-red-500/20" }
    return { label: "Severe Depression", color: "text-red-700 bg-red-600/15 border-red-600/30" }
  }

  const handleSave = (type: string, score: number) => {
    setSavedStatus(`${type} Score (${score}) saved to patient record.`)
    setTimeout(() => setSavedStatus(null), 3000)
  }

  const gadSev = getGadSeverity(gadTotal)
  const phqSev = getPhqSeverity(phqTotal)

  return (
    <Card className="border-border bg-card shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border p-5">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Clinical Assessment Scoring Tools
        </CardTitle>
        <CardDescription className="text-xs">
          Standardized GAD-7 Anxiety and PHQ-9 Depression screening scales.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {savedStatus && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {savedStatus}
          </div>
        )}

        <Tabs defaultValue="gad7" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-xs">
            <TabsTrigger value="gad7" className="text-xs">GAD-7 (Anxiety)</TabsTrigger>
            <TabsTrigger value="phq9" className="text-xs">PHQ-9 (Depression)</TabsTrigger>
          </TabsList>

          {/* GAD-7 TAB */}
          <TabsContent value="gad7" className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Total GAD-7 Score</span>
                <div className="text-2xl font-bold font-mono text-foreground">{gadTotal} / 21</div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${gadSev.color}`}>
                {gadSev.label}
              </span>
            </div>

            <div className="space-y-3">
              {GAD7_QUESTIONS.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-background border border-border space-y-2">
                  <p className="text-xs font-medium text-foreground">{idx + 1}. {q}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const updated = [...gadScores]
                          updated[idx] = opt.value
                          setGadScores(updated)
                        }}
                        className={`p-2 rounded-lg text-[11px] font-medium border transition-all ${
                          gadScores[idx] === opt.value
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-muted/30 hover:bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {opt.label} ({opt.value})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => handleSave("GAD-7", gadTotal)} className="w-full text-xs h-10 rounded-xl gap-2">
              <CheckCircle2 className="h-4 w-4" /> Save GAD-7 Score to Chart
            </Button>
          </TabsContent>

          {/* PHQ-9 TAB */}
          <TabsContent value="phq9" className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Total PHQ-9 Score</span>
                <div className="text-2xl font-bold font-mono text-foreground">{phqTotal} / 27</div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${phqSev.color}`}>
                {phqSev.label}
              </span>
            </div>

            <div className="space-y-3">
              {PHQ9_QUESTIONS.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-background border border-border space-y-2">
                  <p className="text-xs font-medium text-foreground">{idx + 1}. {q}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const updated = [...phqScores]
                          updated[idx] = opt.value
                          setPhqScores(updated)
                        }}
                        className={`p-2 rounded-lg text-[11px] font-medium border transition-all ${
                          phqScores[idx] === opt.value
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-muted/30 hover:bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {opt.label} ({opt.value})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => handleSave("PHQ-9", phqTotal)} className="w-full text-xs h-10 rounded-xl gap-2">
              <CheckCircle2 className="h-4 w-4" /> Save PHQ-9 Score to Chart
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

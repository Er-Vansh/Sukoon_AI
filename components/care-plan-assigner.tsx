"use client"

import { useState } from "react"
import { ClipboardCheck, Plus, CheckCircle2, Clock, Sparkles, Trash2, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HomeworkTask {
  id: string
  title: string
  frequency: string
  status: "assigned" | "completed"
}

const PRESET_TASKS = [
  { title: "5-minute Box Breathing", freq: "Daily before sleep" },
  { title: "Gratitude Journal Reflection", freq: "3x per week" },
  { title: "5-4-3-2-1 Sensory Grounding", freq: "As needed during anxiety" },
  { title: "Binaural 432Hz Soundscape", freq: "15 mins daily" },
]

export function CarePlanAssigner({ patientName = "Patient" }: { patientName?: string }) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([
    { id: "1", title: "5-minute Box Breathing", frequency: "Daily before sleep", status: "completed" },
    { id: "2", title: "Gratitude Journal Reflection", frequency: "3x per week", status: "assigned" },
  ])
  const [customTitle, setCustomTitle] = useState("")
  const [customFreq, setCustomFreq] = useState("Daily")

  const handleAddTask = (title: string, freq: string) => {
    if (!title.trim()) return
    const newTask: HomeworkTask = {
      id: Date.now().toString(),
      title: title.trim(),
      frequency: freq,
      status: "assigned",
    }
    setTasks([newTask, ...tasks])
    setCustomTitle("")
  }

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  return (
    <Card className="border-border bg-card shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border p-5">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> Prescribe Wellness Care Plan & Homework
        </CardTitle>
        <CardDescription className="text-xs">
          Assign therapeutic exercises directly to patient: <strong className="text-foreground">{patientName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Preset Task Prescriptions */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quick Prescribe Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TASKS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddTask(preset.title, preset.freq)}
                className="p-3 rounded-xl border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/30 text-left transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-foreground">{preset.title}</div>
                  <div className="text-[10px] text-muted-foreground">{preset.freq}</div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Task Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Custom exercise title..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="text-xs h-10 rounded-xl bg-background border-border flex-1"
          />
          <Input
            placeholder="Frequency (e.g. Daily)"
            value={customFreq}
            onChange={(e) => setCustomFreq(e.target.value)}
            className="text-xs h-10 rounded-xl bg-background border-border w-36 hidden sm:block"
          />
          <Button
            onClick={() => handleAddTask(customTitle, customFreq)}
            disabled={!customTitle.trim()}
            className="h-10 text-xs px-4 rounded-xl gap-1"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {/* Assigned Tasks List */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Assigned Care Plan ({tasks.length})
          </h4>

          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No homework exercises currently assigned.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        task.status === "completed"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{task.title}</div>
                      <div className="text-[10px] text-muted-foreground">{task.frequency}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        task.status === "completed"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {task.status === "completed" ? "Completed by Patient" : "Pending"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveTask(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/client"

interface AcceptRequestFormProps {
  requestId: string
  patientId: string
  counsellorId: string
}

export function AcceptRequestForm({ requestId, patientId, counsellorId }: AcceptRequestFormProps) {
  const [scheduledDate, setScheduledDate] = useState("")
  const [duration, setDuration] = useState("60")
  const [roomId] = useState(() => Math.random().toString(36).substring(2, 15))
  const [meetingPlatform, setMeetingPlatform] = useState<"zoom" | "google_meet" | "jitsi">("jitsi")
  const [meetingLink, setMeetingLink] = useState(`/meeting/${roomId}`)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const platform = e.target.value as "zoom" | "google_meet" | "jitsi"
    setMeetingPlatform(platform)
    if (platform === "jitsi") {
      setMeetingLink(`/meeting/${roomId}`)
    } else {
      setMeetingLink("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          consultation_request_id: requestId,
          patient_id: patientId,
          counsellor_id: counsellorId,
          scheduled_date: new Date(scheduledDate).toISOString(),
          duration_minutes: Number.parseInt(duration),
          meeting_link: meetingLink,
          meeting_platform: meetingPlatform === "jitsi" ? "other" : meetingPlatform,
          status: "scheduled",
          notes,
        })
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // Update request status
      const { error: requestError } = await supabase
        .from("consultation_requests")
        .update({ status: "accepted", counsellor_id: counsellorId })
        .eq("id", requestId)

      if (requestError) throw requestError

      // Create or update patient history
      const { error: historyError } = await supabase.from("patient_history").upsert(
        {
          counsellor_id: counsellorId,
          patient_id: patientId,
          first_session_date: new Date(scheduledDate).toISOString(),
          last_session_date: new Date(scheduledDate).toISOString(),
          total_sessions: 1,
        },
        {
          onConflict: "counsellor_id,patient_id",
        },
      )

      if (historyError) throw historyError

      router.push("/counsellor/dashboard?success=appointment-created")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create appointment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scheduledDate">Appointment Date & Time</Label>
        <Input
          id="scheduledDate"
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="30"
          step="15"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meetingPlatform">Meeting Platform</Label>
        <select
          id="meetingPlatform"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={meetingPlatform}
          onChange={handlePlatformChange}
          required
        >
          <option value="jitsi">In-App Video (Jitsi)</option>
          <option value="zoom">Zoom</option>
          <option value="google_meet">Google Meet</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meetingLink">Meeting Link</Label>
        <Input
          id="meetingLink"
          type={meetingPlatform === "jitsi" ? "text" : "url"}
          placeholder="https://zoom.us/j/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          required
          readOnly={meetingPlatform === "jitsi"}
          className={meetingPlatform === "jitsi" ? "bg-muted text-muted-foreground" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any notes for this session..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Appointment..." : "Accept & Schedule Appointment"}
      </Button>
    </form>
  )
}

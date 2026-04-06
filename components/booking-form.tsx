"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/client"

interface BookingFormProps {
  counsellorId: string
  patientId: string
}

export function BookingForm({ counsellorId, patientId }: BookingFormProps) {
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("consultation_requests").insert({
        patient_id: patientId,
        counsellor_id: counsellorId,
        subject,
        description,
        preferred_date: preferredDate ? new Date(preferredDate).toISOString() : null,
        status: "pending",
      })

      if (error) throw error

      router.push("/dashboard?success=request-sent")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to send request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="e.g., Anxiety management, Career counselling"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Tell us what you'd like to discuss</Label>
        <Textarea
          id="description"
          placeholder="Describe what you'd like help with..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Preferred Date & Time (Optional)</Label>
        <Input
          id="preferredDate"
          type="datetime-local"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending Request..." : "Send Consultation Request"}
      </Button>
    </form>
  )
}

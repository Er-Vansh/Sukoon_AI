"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"

interface LeaveReviewDialogProps {
  patientId: string
  counsellorId: string
  appointmentId: string
}

export function LeaveReviewDialog({ patientId, counsellorId, appointmentId }: LeaveReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      // Create review
      const { error } = await supabase.from("counsellor_reviews").insert({
        patient_id: patientId,
        counsellor_id: counsellorId,
        appointment_id: appointmentId,
        rating,
        review_text: reviewText,
      })

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You have already reviewed this appointment.")
        } else {
          throw error
        }
      } else {
        toast.success("Review submitted successfully!")
        setIsOpen(false)
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Leave Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Your Session</DialogTitle>
          <DialogDescription>
            Share your experience to help the counsellor and other patients.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write your review here (optional)..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mt-4 resize-none"
            rows={4}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

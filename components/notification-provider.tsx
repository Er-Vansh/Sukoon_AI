"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!user) return

    // Listen for new consultation requests (For Counsellors)
    const requestsChannel = supabase
      .channel('public:consultation_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_requests',
          filter: `counsellor_id=eq.${user.id}`,
        },
        (payload) => {
          toast.success("New Consultation Request", {
            description: `You have received a new consultation request: ${payload.new.subject}`,
          })
        }
      )
      .subscribe()

    // Listen for newly scheduled appointments (For Patients and Counsellors)
    const appointmentsChannel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          toast.success("Appointment Scheduled", {
            description: `A new consultation session has been scheduled for ${new Date(payload.new.scheduled_date).toLocaleString()}.`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultation_requests',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === 'accepted') {
             toast.success("Request Accepted", {
               description: "Your consultation request has been accepted by the counsellor.",
             })
          } else if (payload.new.status === 'rejected') {
             toast.error("Request Declined", {
               description: "A counsellor has declined your consultation request.",
             })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(requestsChannel)
      supabase.removeChannel(appointmentsChannel)
    }
  }, [user, supabase])

  return <>{children}</>
}

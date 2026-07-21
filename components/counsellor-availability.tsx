"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, Check, Plus, Trash2, Loader2 } from "lucide-react"
import { format, addDays, startOfDay, addHours } from "date-fns"
import { toast } from "sonner"

interface Slot {
  id: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export function CounsellorAvailability({ counsellorId }: { counsellorId: string }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))
  const [selectedDay, setSelectedDay] = useState(days[0])

  useEffect(() => {
    async function loadSlots() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("counsellor_slots")
        .select("*")
        .eq("counsellor_id", counsellorId)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })

      if (data) setSlots(data)
      setIsLoading(false)
    }

    if (counsellorId) loadSlots()
  }, [counsellorId])

  const addSlot = async (hour: number) => {
    setIsSaving(true)
    const supabase = createClient()
    
    const startTime = addHours(selectedDay, hour)
    const endTime = addHours(startTime, 1)

    const { data, error } = await supabase
      .from("counsellor_slots")
      .insert({
        counsellor_id: counsellorId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message.includes("unique") ? "Slot already exists" : "Error saving slot")
    } else if (data) {
      setSlots([...slots, data])
      toast.success("Availability added")
    }
    setIsSaving(false)
  }

  const deleteSlot = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("counsellor_slots").delete().eq("id", id)
    
    if (!error) {
      setSlots(slots.filter(s => s.id !== id))
      toast.success("Slot removed")
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Manage Availability
        </CardTitle>
        <CardDescription>Set your bookable time slots for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <Button
              key={day.toISOString()}
              variant={format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd") ? "default" : "outline"}
              onClick={() => setSelectedDay(day)}
              className="flex-col h-16 w-16 min-w-16 p-0"
            >
              <span className="text-[10px] uppercase">{format(day, "EEE")}</span>
              <span className="text-lg font-bold">{format(day, "dd")}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {hours.map((hour) => {
            const currentSlot = slots.find(s => 
              format(new Date(s.start_time), "yyyy-MM-dd HH") === 
              format(addHours(selectedDay, hour), "yyyy-MM-dd HH")
            )

            return (
              <div key={hour} className="relative group">
                {currentSlot ? (
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between pr-2 border-primary/20 bg-primary/5"
                    disabled={currentSlot.is_booked}
                  >
                    <span className="flex items-center gap-2">
                       <Clock className="h-3 w-3" />
                       {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </span>
                    {currentSlot.is_booked ? (
                      <Badge className="bg-orange-500 scale-75">Booked</Badge>
                    ) : (
                      <Trash2 
                        className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); deleteSlot(currentSlot.id); }}
                      />
                    )}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full border border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => addSlot(hour)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

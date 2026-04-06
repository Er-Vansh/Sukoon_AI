"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { ThreeScene } from "@/components/three-scene"
import { Calendar, Clock, Users, Video, LogOut, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"

export default function CounsellorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [patientHistory, setPatientHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)

        const [profileRes, requestsRes, appointmentsRes, historyRes] = await Promise.all([
          supabase.from("profiles").select("*, counsellor_profiles(*)").eq("id", currentUser.id).single(),
          supabase
            .from("consultation_requests")
            .select(`*, profiles!consultation_requests_patient_id_fkey(full_name, email)`)
            .or(`counsellor_id.eq.${currentUser.id},counsellor_id.is.null`)
            .order("created_at", { ascending: false }),
          supabase
            .from("appointments")
            .select(`*, profiles!appointments_patient_id_fkey(full_name, email, phone)`)
            .eq("counsellor_id", currentUser.id)
            .order("scheduled_date", { ascending: true }),
          supabase
            .from("patient_history")
            .select(`*, profiles!patient_history_patient_id_fkey(full_name, email, phone)`)
            .eq("counsellor_id", currentUser.id)
            .order("last_session_date", { ascending: false }),
        ])

        const userType = profileRes.data?.user_type || currentUser.user_metadata?.user_type

        if (userType !== "counsellor") {
          router.push("/dashboard")
          return
        }

        setProfile(profileRes.data)
        setRequests(requestsRes.data || [])
        setAppointments(appointmentsRes.data || [])
        setPatientHistory(historyRes.data || [])
      } catch (error) {
        console.error("[v0] Error loading counsellor dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingRequests = requests?.filter((r) => r.status === "pending") || []
  const upcomingAppointments =
    appointments?.filter((a) => a.status === "scheduled" && new Date(a.scheduled_date) > new Date()) || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <ThreeScene />
      <AppHeader />

      <motion.div
        className="bg-linear-to-br from-primary/5 via-primary/10 to-background border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Counsellor Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome back, {profile?.full_name}</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="gap-2 bg-background/80 hover:bg-background"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="container mx-auto px-4 py-6 md:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { title: "Pending Requests", value: pendingRequests.length, desc: "Awaiting response" },
            { title: "Upcoming Sessions", value: upcomingAppointments.length, desc: "Scheduled" },
            { title: "Total Patients", value: patientHistory?.length || 0, desc: "Connected" },
            {
              title: "Total Sessions",
              value: profile?.counsellor_profiles?.[0]?.total_sessions || 0,
              desc: "Completed",
            },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative overflow-hidden">
                  <CardHeader className="pb-3 relative z-10">
                    <CardDescription className="text-xs md:text-sm">{stat.title}</CardDescription>
                    <CardTitle className="text-3xl md:text-4xl">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">{stat.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="requests" className="gap-1 md:gap-2 text-xs md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-1 md:gap-2 text-xs md:text-sm">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 md:gap-2 text-xs md:text-sm">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Consultation Requests</CardTitle>
                <CardDescription className="text-sm">
                  Review and respond to incoming consultation requests from patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">No pending requests at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        <div className="border border-border rounded-lg p-4 md:p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-base md:text-lg text-foreground">
                                {request.profiles?.full_name}
                              </h3>
                              <p className="text-xs md:text-sm text-muted-foreground">{request.profiles?.email}</p>
                            </div>
                            <Badge className="shrink-0">{request.status}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Subject: {request.subject}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{request.description}</p>
                          </div>
                          {request.preferred_date && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Preferred: {new Date(request.preferred_date).toLocaleString()}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Link href={`/counsellor/requests/${request.id}/accept`} className="flex-1">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button className="w-full gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Accept & Schedule
                                </Button>
                              </motion.div>
                            </Link>
                            <Link href={`/counsellor/requests/${request.id}/reject`}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outline" className="gap-2 bg-transparent w-full sm:w-auto">
                                  <XCircle className="h-4 w-4" />
                                  Decline
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Scheduled Meetings</CardTitle>
                <CardDescription className="text-sm">Your upcoming video consultation appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">No upcoming appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="border border-border rounded-lg p-4 md:p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base md:text-lg text-foreground">
                              {appointment.profiles?.full_name}
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground">{appointment.profiles?.email}</p>
                            {appointment.profiles?.phone && (
                              <p className="text-xs md:text-sm text-muted-foreground">{appointment.profiles.phone}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {new Date(appointment.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {new Date(appointment.scheduled_date).toLocaleTimeString()} (
                              {appointment.duration_minutes} min)
                            </span>
                          </div>
                          {appointment.meeting_link && (
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <Video className="h-4 w-4 text-primary" />
                              <span className="capitalize">{appointment.meeting_platform}</span>
                            </div>
                          )}
                        </div>
                        {appointment.meeting_link && (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full gap-2" asChild>
                              <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </a>
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Connected Patients</CardTitle>
                <CardDescription className="text-sm">History of all patients you've counselled</CardDescription>
              </CardHeader>
              <CardContent>
                {!patientHistory || patientHistory.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm md:text-base">No patient history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientHistory.map((history, index) => (
                      <motion.div
                        key={history.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="border border-border rounded-lg p-4 md:p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base md:text-lg text-foreground">
                              {history.profiles?.full_name}
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground">{history.profiles?.email}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {history.total_sessions} sessions
                          </Badge>
                        </div>
                        <div className="grid gap-2 text-xs md:text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">First Session:</span>
                            <span className="font-medium">
                              {new Date(history.first_session_date).toLocaleDateString()}
                            </span>
                          </div>
                          {history.last_session_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Session:</span>
                              <span className="font-medium">
                                {new Date(history.last_session_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {history.notes && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs md:text-sm text-muted-foreground">{history.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <AppFooter />
    </div>
  )
}

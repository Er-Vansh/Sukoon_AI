"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Star, ArrowLeft, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const [{ data: typedCounsellors }, { data: counsellorProfileRows }] = await Promise.all([
          supabase
            .from("profiles")
            .select(`*, counsellor_profiles(*)`)
            .eq("user_type", "counsellor")
            .order("created_at", { ascending: false }),
          supabase.from("counsellor_profiles").select("id"),
        ])

        const profileIdsFromCounsellorProfiles = (counsellorProfileRows || []).map((row) => row.id)
        const missingIds = profileIdsFromCounsellorProfiles.filter(
          (id) => !(typedCounsellors || []).some((counsellor) => counsellor.id === id),
        )

        let additionalCounsellors: any[] = []
        if (missingIds.length > 0) {
          const { data } = await supabase.from("profiles").select(`*, counsellor_profiles(*)`).in("id", missingIds)
          additionalCounsellors = data || []
        }

        setCounsellors([...(typedCounsellors || []), ...additionalCounsellors])
      } catch (error) {
        console.error("[v0] Error loading counsellors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Professional Counsellors</h1>
                <p className="text-xs text-muted-foreground">Connect with licensed mental health professionals</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Find Your Counsellor</h2>
          <p className="text-muted-foreground">
            Browse our network of experienced mental health professionals ready to support your journey
          </p>
        </motion.div>

        {counsellors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <User className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">No counsellors available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {counsellors.map((counsellor) => {
              const counsellorProfile = counsellor.counsellor_profiles?.[0]
              return (
                <motion.div key={counsellor.id} variants={cardVariants}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <motion.div
                            className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <User className="h-8 w-8 text-primary" />
                          </motion.div>
                          <Badge
                            variant={counsellorProfile?.availability_status === "available" ? "default" : "secondary"}
                          >
                            {counsellorProfile?.availability_status || "offline"}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{counsellor.full_name}</CardTitle>
                        {counsellorProfile?.specialization && (
                          <p className="text-sm text-muted-foreground">{counsellorProfile.specialization}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {counsellorProfile?.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {counsellorProfile.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{counsellorProfile?.rating?.toFixed(1) || "New"}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {counsellorProfile?.total_sessions || 0} sessions
                          </span>
                        </div>

                        {counsellorProfile?.years_of_experience && (
                          <p className="text-sm text-muted-foreground">
                            {counsellorProfile.years_of_experience} years of experience
                          </p>
                        )}

                        <Link href={`/counsellors/${counsellor.id}`}>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full">View Profile & Book</Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

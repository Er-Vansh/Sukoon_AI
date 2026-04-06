"use client"

import type React from "react"
import { motion } from "framer-motion"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Brain } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const userTypeFromAuth = data.user?.user_metadata?.user_type
      const fullNameFromAuth = data.user?.user_metadata?.full_name
      const specializationFromAuth = data.user?.user_metadata?.specialization
      const bioFromAuth = data.user?.user_metadata?.bio
      const resolvedUserType = userTypeFromAuth === "counsellor" ? "counsellor" : "patient"

      // Keep profile rows in sync with auth metadata so counsellors always appear in listings.
      const { error: profileSyncError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullNameFromAuth || data.user.email?.split("@")[0] || "User",
        email: data.user.email || email,
        user_type: resolvedUserType,
      })
      if (profileSyncError) {
        console.error("[login] profile sync failed:", profileSyncError)
      }

      if (resolvedUserType === "counsellor") {
        const { error: counsellorProfileSyncError } = await supabase.from("counsellor_profiles").upsert({
          id: data.user.id,
          specialization:
            typeof specializationFromAuth === "string" && specializationFromAuth.trim().length > 0
              ? specializationFromAuth
              : "General Counselling",
          bio: typeof bioFromAuth === "string" ? bioFromAuth : "",
        })
        if (counsellorProfileSyncError) {
          console.error("[login] counsellor profile sync failed:", counsellorProfileSyncError)
        }
      }

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

      const userType = profile?.user_type || userTypeFromAuth

      if (redirectTo) {
        router.push(redirectTo)
      } else if (userType === "counsellor") {
        router.push("/counsellor/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  )
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")
  const [activeTab, setActiveTab] = useState<"patient" | "counsellor">(
    typeParam === "counsellor" ? "counsellor" : "patient"
  )

  useEffect(() => {
    setActiveTab(typeParam === "counsellor" ? "counsellor" : "patient")
  }, [typeParam])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/30">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-6">
            <Link href="/">
              <motion.div
                className="flex items-center justify-center gap-2 mb-4 cursor-pointer"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Brain className="h-10 w-10 text-primary" />
                <span className="text-3xl font-semibold text-foreground">SukoonAI</span>
              </motion.div>
            </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "patient" | "counsellor")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="counsellor">Counsellor</TabsTrigger>
                  </TabsList>
                  <TabsContent value="patient">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="counsellor">
                    <LoginForm />
                  </TabsContent>
                </Tabs>
                <div className="mt-6 text-center text-sm">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4 text-primary hover:text-primary/80"
                  >
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}

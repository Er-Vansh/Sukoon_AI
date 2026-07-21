"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, EyeOff, FileText, CheckCircle } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "1. Information Security & Encryption",
      content: "All communication inside SukoonAI is encrypted in transit and at rest. Chat sessions with our AI companion and consulting requests with professional counsellors are protected by Row Level Security (RLS) policies inside our PostgreSQL database, meaning your logs are accessible exclusively by you (and the respective counsellor if an appointment is booked).",
    },
    {
      icon: <EyeOff className="h-6 w-6 text-primary" />,
      title: "2. Anonymous Trial Sessions",
      content: "We support anonymous chat sessions. If you communicate with the AI companion without logging in, the trial runs entirely in-memory on your device (messages are logged in localStorage only) and no conversation logs are stored on our servers or databases. Once you register or sign in, you can opt to sync your chats to your account.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "3. What Data We Collect",
      content: "We collect account details (name, email, phone number, and specialization for counsellors) when you register. During consultations, we log date/time, description, subject of consultations, and appointment links. We track completed wellness activities to calculate streak points and gamified rewards. We do NOT harvest or sell mental health logs for advertising purposes.",
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "4. Compliance & Consent",
      content: "By using our website, you consent to this Privacy Policy. You can delete your chat sessions, gratitude journal entries, and mood history at any time from your patient dashboard, which immediately removes the associated data from our operational databases.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Your trust is our foundation. Learn how we secure your mental health conversations, session details, and personal data.
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-md shadow-lg mb-8">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-bold text-foreground">Latest Update: July 2026</h2>
              <p className="text-xs text-muted-foreground mt-1">Version 1.2 — Built by CodeTitans</p>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              At SukoonAI, we recognize that emotional guidance and mental wellness require absolute discretion. We are committed to protecting your personal information and clinical consultation logs under strict compliance frameworks.
            </p>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index} className="bg-card/30 border-border backdrop-blur-xs">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {section.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm md:text-base text-foreground">{section.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick bullet points */}
        <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <h4 className="font-bold text-sm text-primary flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Our Core Privacy Guarantees
          </h4>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 leading-relaxed">
            <li>No data sales: We never exchange mental health profiles with advertisers or aggregators.</li>
            <li>Right to erasure: Users can purge mood records and gratitude journals directly.</li>
            <li>Supabase RLS enabled: Access checks are performed directly at the PostgreSQL layer.</li>
          </ul>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

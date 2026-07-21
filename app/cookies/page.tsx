"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Info, Shield, CheckCircle, Database } from "lucide-react"

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Essential Auth & Session Cookies",
      purpose: "Strictly Necessary",
      description: "These cookies are required to authenticate your account and refresh Supabase auth sessions on every page load. Without these, you cannot log in or access dashboard utilities safely.",
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "Theme & Localization Settings",
      purpose: "Preferences",
      description: "We use local browser storage and cookie settings (via next-themes) to persist your preferred color mode (system/light/dark) and i18n language translation context.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Anonymous Trial Tracker",
      purpose: "Functionality",
      description: "For unlogged-in users, we set a localStorage flag (`sukoon_anon_chat_count`) to track your 3-message free trial limit, ensuring we can prompt you to register when the trial finishes.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Info className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Cookie Policy</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            We use cookies to secure authentication states, persist layout themes, and manage trial message counts. Read on to learn how we leverage local storage technologies.
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-md shadow-lg mb-8">
          <CardContent className="p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b pb-3">What Are Cookies?</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Cookies and local browser storage are small text files placed on your computer or device when you browse websites. They are widely used to make web apps function efficiently, authenticate user roles, and customize user preferences.
            </p>
          </CardContent>
        </Card>

        {/* Cookie list */}
        <div className="space-y-6">
          {cookieTypes.map((cookie, index) => (
            <Card key={index} className="bg-card/30 border-border backdrop-blur-xs">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {cookie.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="font-bold text-sm md:text-base text-foreground">{cookie.title}</h3>
                    <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                      {cookie.purpose}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-2">{cookie.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

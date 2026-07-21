"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Accessibility, Eye, Volume2, ShieldAlert, BadgeCheck } from "lucide-react"

export default function AccessibilityPage() {
  const complianceItems = [
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "Contrast & Visual Semantics",
      description: "Our OKLCH color palettes (indigo, purple, and teal) are optimized to fulfill WCAG 2.1 AA requirements for contrast. We leverage clean semantic HTML hierarchy (h1, h2, sections) and alt attributes to make content distinguishable for low-vision users and screen-readers.",
    },
    {
      icon: <Volume2 className="h-6 w-6 text-primary" />,
      title: "Screen Reader Adaptability",
      description: "All interactive buttons, modals, and input fields use custom aria attributes, labels, and role descriptions (e.g. Radix UI primitives inside sheets, dialogs, and navigation drawers) to guarantee screen-reader compatibility.",
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-primary" />,
      title: "Keyboard Control",
      description: "Users can navigate through our dashboards, counsellor cards, wellness activities, and floating chat windows fully using standard keyboard layouts (Tab, Enter, Escape, Space). No keyboard traps are present.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Accessibility className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Accessibility Statement</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            We are dedicated to ensuring that emotional support and counselling consultation platforms are accessible to all users, regardless of ability or technology.
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-md shadow-lg mb-8">
          <CardContent className="p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b pb-3">Our Standards Commitment</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              SukoonAI is actively developed and tested to align with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA specifications. We view accessibility as a continuous optimization journey to build a healthier, more inclusive world together.
            </p>
          </CardContent>
        </Card>

        {/* Compliance details */}
        <div className="space-y-6">
          {complianceItems.map((item, index) => (
            <Card key={index} className="bg-card/30 border-border backdrop-blur-xs">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm md:text-base text-foreground">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-xl border border-destructive/20 bg-destructive/5 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-destructive">Help Us Improve</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you experience any accessibility hurdles while trying to interact with our wellness games, booking appointments, or chatting with the AI widget, please let us know by reaching out via our <a href="/contact" className="underline font-semibold text-primary hover:text-primary/80">Contact Page</a>.
            </p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

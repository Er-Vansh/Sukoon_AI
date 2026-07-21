"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertTriangle, ShieldCheck, Scale, CheckSquare } from "lucide-react"

export default function TermsPage() {
  const provisions = [
    {
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      title: "1. Medical Disclaimer & Crisis Alert",
      content: "SukoonAI's AI companion (Dr. Emily Hartman) is an emotional guidance system and wellness utility; she is NOT a qualified physician, psychologist, or medical provider. AI responses do not constitute medical advice or diagnosis. If you are experiencing thoughts of self-harm or a severe psychiatric crisis, you must seek professional emergency care or access safety hotlines using our red Emergency SOS button.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "2. Marketplace Engagement",
      content: "We provide a directory of licensed professional counsellors. The request, acceptance, and scheduling of appointments represent contracts exclusively between the patient and the counsellor. SukoonAI is not liable for counsellor diagnostic accuracy, consultation quality, or meeting availability.",
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-primary" />,
      title: "3. User Conduct Guidelines",
      content: "You agree to provide true, accurate account registration data. Abuse, harassment, threatening behavior, or spam directed at professional counsellors or other users will lead to immediate account termination and permanent blocking from the platform.",
    },
    {
      icon: <Scale className="h-6 w-6 text-primary" />,
      title: "4. Limitations of Liability",
      content: "To the maximum extent permitted by law, SukoonAI and its developers (CodeTitans) shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our AI chat widgets, database integrations, or consultation networks.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Please read these terms carefully. They outline the guidelines, disclaimers, and legal parameters for using our wellness platforms.
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-md shadow-lg mb-8">
          <CardContent className="p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b pb-3">Agreement to Terms</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              By accessing SukoonAI, you represent that you are at least 18 years of age (or have explicit parental/guardian consent) and agree to be legally bound by these terms. If you do not agree to these policies, please stop using our services immediately.
            </p>
          </CardContent>
        </Card>

        {/* Provisions Grid */}
        <div className="space-y-6">
          {provisions.map((prov, index) => (
            <Card key={index} className="bg-card/30 border-border backdrop-blur-xs">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {prov.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm md:text-base text-foreground">{prov.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{prov.content}</p>
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

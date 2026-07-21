"use client"

import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Compass, ExternalLink, Globe, Home, Shield, User, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function SitemapPage() {
  const groups = [
    {
      title: "Main Navigation",
      icon: <Home className="h-5 w-5 text-primary" />,
      links: [
        { href: "/", label: "Landing Home" },
        { href: "/counsellors", label: "Find Counsellors" },
        { href: "/contact", label: "Contact Us" },
      ],
    },
    {
      title: "User Accounts & Portals",
      icon: <User className="h-5 w-5 text-primary" />,
      links: [
        { href: "/auth/login", label: "Login Portal" },
        { href: "/auth/sign-up", label: "Registration" },
        { href: "/dashboard", label: "Patient Dashboard (Protected)" },
        { href: "/counsellor/dashboard", label: "Counsellor Dashboard (Protected)" },
      ],
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
      links: [
        { href: "/help", label: "Help Center & FAQs" },
      ],
    },
    {
      title: "Legal & Compliance",
      icon: <Shield className="h-5 w-5 text-primary" />,
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/accessibility", label: "Accessibility Statement" },
        { href: "/cookies", label: "Cookie Policy" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="space-y-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Sitemap</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            A comprehensive list of all accessible links, dashboards, and support pages on SukoonAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group, index) => (
            <Card key={index} className="bg-card/40 border-border backdrop-blur-xs">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 border-b pb-2">
                  {group.icon}
                  {group.title}
                </h2>
                
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group">
                        <span>{link.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary transition-colors flex items-center gap-1">
                          {link.href}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

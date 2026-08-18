import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/components/notification-provider"
import { Toaster } from "sonner"
import { EmergencySOS } from "@/components/emergency-sos"
import { AIChatWidget } from "@/components/ai-chat-widget"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SukoonAI - AI Therapy & Professional Counselling",
  description:
    "Experience compassionate mental health support through AI therapy and professional counselling services. Connect with licensed counsellors for video consultations.",
  generator: "SukoonAI",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "SukoonAI - Mental Health & Wellness Companion",
    description:
      "Your compassionate AI mental health companion for emotional support, 1-on-1 counsellor video bookings, mood tracking, and mindfulness games.",
    url: "https://sukoonai.com",
    siteName: "SukoonAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SukoonAI - Mental Health & Wellness Companion",
    description:
      "Your compassionate AI mental health companion for emotional support, 1-on-1 counsellor video bookings, mood tracking, and mindfulness games.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
          <body className={`font-sans antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <NotificationProvider>
                {children}
                <EmergencySOS />
                <AIChatWidget />
              </NotificationProvider>
              <Toaster position="top-right" richColors />
            </ThemeProvider>
            <Analytics />
          </body>
    </html>
  )
}

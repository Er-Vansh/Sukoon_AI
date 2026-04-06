import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SukoonAI - AI Therapy & Professional Counselling",
  description:
    "Experience compassionate mental health support through AI therapy and professional counselling services. Connect with licensed counsellors for video consultations.",
  generator: "CodeTitans",
    icons: {
      icon: "/favicon.svg",
      apple: "/apple-icon.png",
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
              {children}
            </ThemeProvider>
            <Analytics />
          </body>
    </html>
  )
}

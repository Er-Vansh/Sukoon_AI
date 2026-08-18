"use client"

import { motion } from "framer-motion"
import { Compass, Home, LayoutDashboard, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card/80 backdrop-blur-md border border-primary/20 p-8 rounded-3xl shadow-2xl text-center space-y-6 relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-500 shadow-inner">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "20s" }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground pt-1">Finding Your Way Back</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist or has moved. Let's guide you back to peace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white rounded-2xl font-bold px-6 h-11 shadow-md shadow-primary/20 gap-2"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-2xl font-bold px-6 h-11 border-primary/20 hover:bg-primary/10 gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" /> Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

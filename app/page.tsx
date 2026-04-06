"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Ripple } from "@/components/ui/ripple"
import { ThreeScene } from "@/components/three-scene"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  Brain,
  Calendar,
  Heart,
  Lock,
  Shield,
  Users,
  Video,
  MessageCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Headphones,
  Award,
  FileText,
  UserPlus,
  Search,
  Zap,
} from "lucide-react"

const moods = [
  { emoji: "😔", label: "Down", value: 0 },
  { emoji: "😊", label: "Content", value: 1 },
  { emoji: "😌", label: "Peaceful", value: 2 },
  { emoji: "🤗", label: "Happy", value: 3 },
  { emoji: "✨", label: "Excited", value: 4 },
]

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState(2)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 md:py-24 text-center overflow-hidden">
        <Ripple />
        <ThreeScene />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 hover:bg-primary/20 transition-colors">
              <Sparkles className="inline h-4 w-4 mr-1" />
              Your AI-Powered Mental Health Companion
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight text-balance"
            variants={itemVariants}
          >
            Find Peace of Mind
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
            variants={itemVariants}
          >
            Experience a new way of emotional support. Our AI companion and professional counsellors are here to listen,
            understand, and guide you through life's journey.
          </motion.p>

            <motion.div
              className="max-w-md mx-auto p-6 md:p-8 bg-card rounded-2xl border border-border shadow-lg transition-colors duration-500"
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              style={{
                background: `linear-gradient(135deg, var(--card) 0%, ${
                  selectedMood === 0 ? "rgba(148, 163, 184, 0.1)" :
                  selectedMood === 1 ? "rgba(16, 185, 129, 0.1)" :
                  selectedMood === 2 ? "rgba(6, 182, 212, 0.1)" :
                  selectedMood === 3 ? "rgba(245, 158, 11, 0.1)" :
                  "rgba(236, 72, 153, 0.1)"
                } 100%)`
              }}
            >
              <p className="text-sm text-muted-foreground mb-4">How are you feeling today?</p>
              <div className="flex justify-between text-3xl md:text-4xl mb-4">
                {moods.map((mood, index) => (
                  <motion.button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2"
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: selectedMood === index ? 1.2 : 1,
                      filter: selectedMood === index ? "grayscale(0%)" : "grayscale(60%)",
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 20 },
                      rotate: { type: "keyframes", duration: 0.5 }
                    }}
                  >
                    {mood.emoji}
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, ${
                      selectedMood >= 0 ? "#94a3b8" : "#e2e8f0"
                    } 0%, ${
                      selectedMood >= 1 ? "#10b981" : "#e2e8f0"
                    } 25%, ${
                      selectedMood >= 2 ? "#06b6d4" : "#e2e8f0"
                    } 50%, ${
                      selectedMood >= 3 ? "#f59e0b" : "#e2e8f0"
                    } 75%, ${
                      selectedMood >= 4 ? "#ec4899" : "#e2e8f0"
                    } 100%)`
                  }}
                />
                <motion.div
                  className="absolute -top-8 px-3 py-1 rounded-md text-sm font-medium text-primary-foreground shadow-sm"
                  animate={{
                    left: `${(selectedMood / 4) * 100}%`,
                    x: "-50%",
                    backgroundColor: 
                      selectedMood === 0 ? "#94a3b8" :
                      selectedMood === 1 ? "#10b981" :
                      selectedMood === 2 ? "#06b6d4" :
                      selectedMood === 3 ? "#f59e0b" :
                      "#ec4899"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {moods[selectedMood].label}
                </motion.div>
              </div>
            <p className="text-xs text-muted-foreground mt-6">Slide to express how you're feeling</p>
          </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center pt-4" variants={itemVariants}>
              <a href="https://frontend-9pry.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 w-full">
                    <MessageCircle className="h-5 w-5" />
                    Start AI Therapy
                  </Button>
                </motion.div>
              </a>
              <Link href="/counsellors" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent w-full">
                  <Users className="h-5 w-5" />
                  Find a Counsellor
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How SukoonAI Helps You</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Experience a new kind of emotional support, powered by empathetic AI and professional counsellors
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
            {[
              {
                icon: Clock,
                title: "24/7 AI Support",
                desc: "Always here to listen and support you, any time of day or night",
                color: "primary",
                threeType: "sparkles",
              },
              {
                icon: Brain,
                title: "Smart Insights",
                desc: "Personalized guidance powered by emotional intelligence",
                color: "accent",
                threeType: "brain",
              },
              {
                icon: Lock,
                title: "Private & Secure",
                desc: "Your conversations are always confidential and encrypted",
                color: "primary",
                threeType: "shield",
              },
              {
                icon: Shield,
                title: "Evidence-Based",
                desc: "Therapeutic techniques backed by clinical research",
                color: "accent",
                threeType: "heart",
              },
            ].map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="p-6 md:p-8 text-center border-border h-full overflow-hidden relative group">
                      <motion.div
                        className={`h-14 w-14 md:h-16 md:w-16 mx-auto mb-4 md:mb-6 ${
                          feature.color === "primary" ? "bg-primary/10" : "bg-accent/20"
                        } rounded-full flex items-center justify-center`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon
                          className={`h-7 w-7 md:h-8 md:w-8 ${
                            feature.color === "primary" ? "text-primary" : "text-accent-foreground"
                          }`}
                        />
                      </motion.div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-card-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </Card>
                  </motion.div>
                </motion.div>
            ))}

        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Simple steps to start your journey towards better mental health
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: UserPlus,
                title: "Create Account",
                desc: "Sign up for free in minutes and complete your profile",
                num: 1,
              },
              {
                icon: MessageCircle,
                title: "Start AI Chat",
                desc: "Begin chatting with our AI therapist instantly, available 24/7",
                num: 2,
              },
              {
                icon: Search,
                title: "Browse Counsellors",
                desc: "Explore profiles of licensed counsellors and find your match",
                num: 3,
              },
              {
                icon: Calendar,
                title: "Book Session",
                desc: "Schedule appointments at times that work for your lifestyle",
                num: 4,
              },
              {
                icon: Video,
                title: "Attend Meeting",
                desc: "Join secure video consultations via Zoom or Google Meet",
                num: 5,
              },
              {
                icon: Heart,
                title: "Continue Journey",
                desc: "Track progress and maintain ongoing support with your counsellor",
                num: 6,
              },
            ].map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="p-6 md:p-8 border-border relative overflow-hidden group h-full">
                    <motion.div
                      className="absolute top-4 right-4 text-5xl font-bold text-primary/10"
                      whileHover={{ scale: 1.2, color: "rgba(var(--primary), 0.2)" }}
                    >
                      {step.num}
                    </motion.div>
                    <step.icon className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4 relative z-10" />
                    <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-card-foreground">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.desc}</p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8 md:mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/counsellors">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Get Started Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div
          className="max-w-3xl mx-auto space-y-6 md:space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Begin Your Journey to Wellness</h2>
          <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
            Whether you need immediate AI support or want to connect with a professional counsellor, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full">
                  Create Free Account
                </Button>
              </motion.div>
            </Link>
            <Link href="/auth/login?type=counsellor" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="w-full bg-transparent">
                  I'm a Counsellor
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      <AppFooter />
    </div>
  )
}

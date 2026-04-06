"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Clock, Globe } from "lucide-react"
import { submitContactForm } from "./actions"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData(event.currentTarget)
    const response = await submitContactForm(formData)
    
    setResult(response)
    setIsSubmitting(false)
    if (response.success) {
      ;(event.target as HTMLFormElement).reset()
    }
  }

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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12 md:py-20 border-b">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Contact Us</h1>
              <p className="text-lg text-muted-foreground text-balance">
                Have questions or need support? We're here to help you on your journey to wellness.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div
              className="lg:col-span-1 space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </motion.div>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email Us",
                    content: "vanshmaurya01234@gmail.com",
                    sub: "support@sukoonai.com",
                  },
                  {
                    icon: Phone,
                    title: "Call Us",
                    content: "7652015646",
                    sub: "Mon-Fri 9am-6pm EST",
                  },
                  {
                    icon: MapPin,
                    title: "Visit Us",
                    content: "Gomti Nagar, Lucknow",
                    sub: "Uttar Pradesh, India",
                  },
                ].map((item, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-foreground">{item.content}</p>
                      <p className="text-sm text-muted-foreground">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                variants={itemVariants}
                className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Response Time
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our average response time for queries is less than 4 hours during business hours.
                </p>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll connect you with the right person.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-background" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="How can we help?" required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message here..."
                        className="min-h-37.5 bg-background resize-none"
                        required
                      />
                    </div>

                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg text-sm ${
                          result.success ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                      >
                        {result.message}
                      </motion.div>
                    )}

                    <Button type="submit" className="w-full sm:w-auto gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Extra Info Grid */}
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: MessageSquare, title: "Support Chat", desc: "Available 24/7" },
                  { icon: Globe, title: "Global Reach", desc: "Support in 10+ languages" },
                  { icon: Send, title: "Quick Connect", desc: "Instant help available" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card/50 flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}

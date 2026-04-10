"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Activity, Heart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const steps = [
  {
    title: "Welcome to Sukoon AI",
    description: "Your safe, private space for mental health support. Let's take a quick tour of what's available.",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    title: "Track Your Mood",
    description: "Check in daily to build an emotional history. We will curate special therapeutic activities strictly tailored to how you are feeling in the moment.",
    icon: Activity,
    color: "text-blue-500",
  },
  {
    title: "Relaxing Activities",
    description: "Explore our dynamic anxiety-relief games, from guided yoga flows to memory mapping and structured 5-4-3-2-1 breathing techniques.",
    icon: Heart,
    color: "text-rose-500",
  },
  {
    title: "Book a Professional",
    description: "Need someone to talk to? Instantly schedule private, secure in-app video sessions with our licensed professional counsellors.",
    icon: Calendar,
    color: "text-green-500",
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if the user has completed onboarding
    const hasSeenOnboarding = localStorage.getItem("sukoon_onboarding_completed")
    if (!hasSeenOnboarding) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Completed
      localStorage.setItem("sukoon_onboarding_completed", "true")
      setIsOpen(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("sukoon_onboarding_completed", "true")
    setIsOpen(false)
  }

  const StepIcon = steps[currentStep].icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="pt-4">
          <DialogTitle className="text-center text-xl">Getting Started</DialogTitle>
        </DialogHeader>
        
        <div className="relative min-h-[220px] flex items-center justify-center p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-4 inset-0"
            >
              <div className={`p-4 rounded-full bg-muted/50 ${steps[currentStep].color}`}>
                <StepIcon className="h-10 w-10" />
              </div>
              <h3 className="font-semibold text-lg">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col space-y-3 mt-4">
          <div className="flex justify-center gap-1 mb-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  idx === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

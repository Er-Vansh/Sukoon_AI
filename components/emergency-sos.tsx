"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Phone, Heart, Wind, X, ExternalLink, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

export function EmergencySOS() {
  const [isOpen, setIsOpen] = useState(false)

  const helplines = [
    { name: "Kiran (National)", number: "1800-599-0019", desc: "Mental Health Helpline (Govt)" },
    { name: "iCall (TISS)", number: "9152987821", desc: "Professional counselling support" },
    { name: "Vandrevala Foundation", number: "9999666555", desc: "24/7 Crisis Support" },
    { name: "NIMHANS", number: "080-46110007", desc: "Psychosocial Support Line" },
  ]

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-100"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 border-4 border-background animate-pulse"
        >
          <AlertCircle className="h-7 w-7 text-white" />
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto border-destructive/20 bg-linear-to-b from-background to-destructive/5">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-destructive">Emergency Support</DialogTitle>
            <DialogDescription className="text-center text-base">
              If you are in immediate danger or having suicidal thoughts, please reach out for help right now. You are not alone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
            <div className="grid gap-3">
              {helplines.map((helpline) => (
                <Card key={helpline.name} className="border-destructive/10 hover:border-destructive/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{helpline.name}</h4>
                      <p className="text-xs text-muted-foreground">{helpline.desc}</p>
                      <p className="text-lg font-mono font-bold text-primary mt-1">{helpline.number}</p>
                    </div>
                    <Button variant="outline" size="icon" asChild className="rounded-full">
                      <a href={`tel:${helpline.number.replace(/-/g, "")}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-2">
               <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Quick Self-Help</p>
               <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2 justify-start h-12" onClick={() => setIsOpen(false)}>
                    <Wind className="h-4 w-4 text-primary" />
                    <span>Breathe Now</span>
                  </Button>
                  <Button variant="outline" className="gap-2 justify-start h-12" asChild>
                    <a href="https://www.psychologytoday.com/in/counsellors" target="_blank">
                      <Heart className="h-4 w-4 text-destructive" />
                      <span>Find Help Near Me</span>
                    </a>
                  </Button>
               </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="ghost" className="text-muted-foreground text-xs" onClick={() => setIsOpen(false)}>
              Close this window
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

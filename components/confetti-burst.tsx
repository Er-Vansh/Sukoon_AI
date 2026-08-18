"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  shape: "circle" | "square" | "star"
}

interface ConfettiBurstProps {
  trigger: boolean
  onComplete?: () => void
  count?: number
}

const COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
]

export function ConfettiBurst({ trigger, onComplete, count = 36 }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger) return

    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 360 + (Math.random() * 20 - 10)
      const distance = 80 + Math.random() * 140
      const rad = (angle * Math.PI) / 180

      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 20,
        rotation: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "square" : "circle",
      }
    })

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
      if (onComplete) onComplete()
    }, 1200)

    return () => clearTimeout(timer)
  }, [trigger, count, onComplete])

  if (particles.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50 overflow-visible">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: p.scale,
              opacity: [1, 1, 0],
              rotate: p.rotation,
            }}
            transition={{
              duration: 1.1,
              ease: "easeOut",
            }}
            style={{ position: "absolute" }}
          >
            {p.shape === "circle" && (
              <div
                className="w-3 h-3 rounded-full shadow-xs"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === "square" && (
              <div
                className="w-3 h-3 rounded-xs shadow-xs"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === "star" && (
              <div
                className="w-4 h-4 shadow-xs"
                style={{
                  backgroundColor: p.color,
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

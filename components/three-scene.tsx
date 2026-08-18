"use client"

import { motion } from "framer-motion"

export function ThreeScene() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-60 dark:opacity-40">
      {/* Primary Purple Ambient Glow Blob */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -right-24 w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-primary/30 blur-[100px] will-change-transform"
      />

      {/* Secondary Soothing Turquoise Ambient Glow Blob */}
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -left-32 w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full bg-gradient-to-br from-cyan-500/25 via-teal-500/15 to-blue-600/20 blur-[110px] will-change-transform"
      />

      {/* Third Emerald Ambient Accent Glow Blob */}
      <motion.div
        animate={{
          x: [0, 25, -25, 0],
          y: [0, -25, 25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-24 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-green-400/15 to-amber-500/15 blur-[95px] will-change-transform"
      />
    </div>
  )
}

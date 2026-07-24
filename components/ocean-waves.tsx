"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Waves, Volume2, VolumeX, Play, Pause, CloudRain, Sparkles, Disc, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

type TrackType = "waves" | "rain" | "binaural" | "cosmic"

interface Track {
  id: TrackType
  name: string
  desc: string
  icon: any
}

const TRACKS: Track[] = [
  { id: "waves", name: "Ocean Waves", desc: "Soothing surge of sea tide", icon: Waves },
  { id: "rain", name: "Gentle Rain", desc: "Soft, grounding raindrops", icon: CloudRain },
  { id: "binaural", name: "Binaural 432Hz", desc: "8Hz theta healing frequency", icon: Sparkles },
  { id: "cosmic", name: "Cosmic Delta", desc: "Deep space relaxation drone", icon: Disc },
]

export function OceanWaves() {
  const [activeTrack, setActiveTrack] = useState<TrackType>("waves")
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(60)
  const [timerMinutes, setTimerMinutes] = useState<number>(15)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60)
  
  const waveControls = useAnimation()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const activeNodesRef = useRef<any[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)

  // Initialize Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Stop any active Web Audio nodes
  const stopAudioNodes = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop()
        if (node.disconnect) node.disconnect()
      } catch (e) {}
    })
    activeNodesRef.current = []
  }

  // Synthesize selected soundscape using Web Audio API
  const startAudioSynthesis = (track: TrackType) => {
    stopAudioNodes()
    const ctx = getAudioContext()

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime((volume / 100) * 0.4, ctx.currentTime)
    masterGain.connect(ctx.destination)
    gainNodeRef.current = masterGain

    if (track === "waves" || track === "rain") {
      // Create Pink/White Noise Buffer for Ocean or Rain
      const bufferSize = ctx.sampleRate * 4
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        output[i] *= 0.11
        b6 = white * 0.115926
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"

      if (track === "waves") {
        filter.frequency.setValueAtTime(400, ctx.currentTime)
        // LFO for wave swelling
        const lfo = ctx.createOscillator()
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime) // 8 second cycle
        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(300, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)
        lfo.start()
        activeNodesRef.current.push(lfo)
      } else {
        // Rain filter
        filter.frequency.setValueAtTime(1200, ctx.currentTime)
      }

      whiteNoise.connect(filter)
      filter.connect(masterGain)
      whiteNoise.start()
      activeNodesRef.current.push(whiteNoise)
    } else if (track === "binaural") {
      // Binaural 432Hz left ear + 440Hz right ear = 8Hz theta beat
      const merger = ctx.createChannelMerger(2)
      
      const oscL = ctx.createOscillator()
      oscL.type = "sine"
      oscL.frequency.setValueAtTime(432, ctx.currentTime)
      oscL.connect(merger, 0, 0) // Left

      const oscR = ctx.createOscillator()
      oscR.type = "sine"
      oscR.frequency.setValueAtTime(440, ctx.currentTime)
      oscR.connect(merger, 0, 1) // Right

      merger.connect(masterGain)
      oscL.start()
      oscR.start()
      activeNodesRef.current.push(oscL, oscR)
    } else if (track === "cosmic") {
      // Sub-bass cosmic drone (108Hz + 162Hz harmonic)
      const osc1 = ctx.createOscillator()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(108, ctx.currentTime)

      const osc2 = ctx.createOscillator()
      osc2.type = "triangle"
      osc2.frequency.setValueAtTime(162, ctx.currentTime)

      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(250, ctx.currentTime)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(masterGain)
      osc1.start()
      osc2.start()
      activeNodesRef.current.push(osc1, osc2)
    }
  }

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.4, audioCtxRef.current.currentTime)
    }
  }, [volume])

  // Timer countdown & smooth fadeout
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false)
            stopAudioNodes()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      waveControls.start({
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      })
    } else {
      waveControls.stop()
      stopAudioNodes()
    }
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  const togglePlay = () => {
    if (isPlaying) {
      stopAudioNodes()
      setIsPlaying(false)
    } else {
      startAudioSynthesis(activeTrack)
      setIsPlaying(true)
    }
  }

  const switchTrack = (t: TrackType) => {
    setActiveTrack(t)
    if (isPlaying) {
      startAudioSynthesis(t)
    }
  }

  const setTimerDuration = (mins: number) => {
    setTimerMinutes(mins)
    setTimeLeft(mins * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentTrackObj = TRACKS.find((t) => t.id === activeTrack) || TRACKS[0]
  const IconComponent = currentTrackObj.icon

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-6 bg-card/60 backdrop-blur-md border border-border rounded-3xl shadow-xl">
      {/* Sound Visualizer Pulse */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <motion.div animate={waveControls} className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner">
            <IconComponent className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Title & Track Details */}
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg text-foreground">{currentTrackObj.name}</h3>
        <p className="text-xs text-muted-foreground">{currentTrackObj.desc}</p>
      </div>

      {/* Track Selection Pills */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {TRACKS.map((t) => {
          const TIcon = t.icon
          const isActive = activeTrack === t.id
          return (
            <button
              key={t.id}
              onClick={() => switchTrack(t.id)}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                  : "bg-muted/40 hover:bg-muted border-border text-foreground"
              }`}
            >
              <TIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.name}</span>
            </button>
          )
        })}
      </div>

      {/* Volume Control */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Volume</span>
          <span>{volume}%</span>
        </div>
        <div className="flex items-center gap-3">
          {volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
          <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={100} step={1} className="flex-1" />
        </div>
      </div>

      {/* Sleep Timer Preset Selector */}
      <div className="w-full flex items-center justify-between text-xs border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-4 w-4 text-primary" />
          <span>Sleep Timer</span>
        </div>
        <div className="flex gap-1">
          {[5, 15, 30, 60].map((m) => (
            <button
              key={m}
              onClick={() => setTimerDuration(m)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                timerMinutes === m ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Play / Pause & Time Bar */}
      <div className="w-full space-y-2">
        <Progress value={((timerMinutes * 60 - timeLeft) / (timerMinutes * 60)) * 100} className="h-1.5" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{formatTime(timeLeft)}</span>
          <Button onClick={togglePlay} size="icon" className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <span className="text-xs font-mono text-muted-foreground">{timerMinutes}:00</span>
        </div>
      </div>
    </div>
  )
}


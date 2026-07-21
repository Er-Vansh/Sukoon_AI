"use client"

import React from "react"
import { Lightbulb, CheckCircle2 } from "lucide-react"

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (!content) return null

  // For user messages, render standard text directly
  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
  }

  // Parse inline bolding: **bold text** -> <strong>bold text</strong>
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  
  let currentBullets: { key?: string; text: string }[] = []
  let calloutBuffer: string[] = []
  let calloutTitle = ""
  let inCallout = false

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2.5 space-y-2 pl-0.5">
          {currentBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
              <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary/80" />
              <div className="flex-1">
                {bullet.key && (
                  <strong className="font-semibold text-foreground mr-1.5">
                    {bullet.key}:
                  </strong>
                )}
                <span className="text-foreground/90">{parseInline(bullet.text)}</span>
              </div>
            </li>
          ))}
        </ul>
      )
      currentBullets = []
    }
  }

  const flushCallout = () => {
    if (calloutBuffer.length > 0 || calloutTitle) {
      elements.push(
        <div
          key={`callout-${elements.length}`}
          className="my-3.5 rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-3.5 dark:bg-amber-950/20 text-foreground shadow-xs"
        >
          <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400 text-xs sm:text-sm mb-1.5">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{calloutTitle || "Practical Action / Tip"}</span>
          </div>
          <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-1">
            {calloutBuffer.map((line, idx) => (
              <p key={idx}>{parseInline(line)}</p>
            ))}
          </div>
        </div>
      )
      calloutBuffer = []
      calloutTitle = ""
      inCallout = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      if (inCallout) continue
      flushBullets()
      continue
    }

    // Header title with 📌
    if (trimmed.startsWith("📌")) {
      flushBullets()
      flushCallout()
      const titleText = trimmed.replace("📌", "").replace(/\*\*/g, "").trim()
      elements.push(
        <div key={`header-${i}`} className="mb-2 pb-1 border-b border-border/50">
          <h3 className="text-sm sm:text-base font-bold text-primary flex items-center gap-2">
            <span className="text-base">📌</span>
            <span>{titleText}</span>
          </h3>
        </div>
      )
      continue
    }

    // Subheading with 🔹
    if (trimmed.startsWith("🔹")) {
      flushBullets()
      flushCallout()
      const subText = trimmed.replace("🔹", "").replace(/\*\*/g, "").trim()
      elements.push(
        <div key={`sub-${i}`} className="mt-3 mb-1.5">
          <h4 className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <span className="text-sm">🔹</span>
            <span>{subText}</span>
          </h4>
        </div>
      )
      continue
    }

    // Callout Box Header with 💡
    if (trimmed.startsWith("💡")) {
      flushBullets()
      flushCallout()
      inCallout = true
      const cTitle = trimmed.replace("💡", "").replace(/\*\*/g, "").trim()
      calloutTitle = cTitle
      continue
    }

    if (inCallout) {
      calloutBuffer.push(trimmed)
      continue
    }

    // Bullet points (- or * or •)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const itemContent = trimmed.replace(/^[-*•]\s*/, "").trim()
      const boldMatch = itemContent.match(/^\*\*(.*?)\*\*\s*:\s*(.*)/)
      if (boldMatch) {
        currentBullets.push({ key: boldMatch[1], text: boldMatch[2] })
      } else {
        currentBullets.push({ text: itemContent })
      }
      continue
    }

    // Standard text line
    flushBullets()
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed my-1 text-foreground/90">
        {parseInline(trimmed)}
      </p>
    )
  }

  flushBullets()
  flushCallout()

  return <div className="space-y-1">{elements}</div>
}

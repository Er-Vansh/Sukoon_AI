"use client"

import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function GsapInit() {
  useEffect(() => {
    // Hero section animations - faster initial load
    gsap.from(".hero-badge", {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.out",
    })

    gsap.from(".hero-title", {
      opacity: 0,
      y: 30,
      duration: 0.5,
      delay: 0.1,
      ease: "power2.out",
    })

    gsap.from(".hero-description", {
      opacity: 0,
      y: 20,
      duration: 0.4,
      delay: 0.2,
      ease: "power2.out",
    })

    gsap.from(".hero-mood-slider", {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      delay: 0.3,
      ease: "power2.out",
    })

    gsap.from(".hero-cta", {
      opacity: 0,
      y: 20,
      duration: 0.4,
      delay: 0.4,
      ease: "power2.out",
    })

    // Feature cards scroll animation - minimal stagger
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: ".features-section",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 30,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    })

    // Counselling cards scroll animation - minimal stagger
    gsap.from(".counselling-card", {
      scrollTrigger: {
        trigger: ".counselling-section",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 30,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    })

    // Section titles scroll animation
    gsap.utils.toArray<HTMLElement>(".section-title").forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      })
    })

    // CTA section animation
    gsap.from(".cta-content", {
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      scale: 0.98,
      duration: 0.5,
      ease: "power2.out",
    })
  }, [])

  return null
}

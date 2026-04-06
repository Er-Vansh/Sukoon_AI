import { useState } from "react"

interface Toast {
  title: string
  description?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description }: Toast) => {
    setToasts(prev => [...prev, { title, description }])
    // In a real implementation, this would show a toast notification
    console.log("Toast:", title, description)
  }

  return { toast }
}
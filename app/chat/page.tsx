import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AIChatInterface } from "@/components/ai-chat-interface"

export default async function ChatPage() {
  const requestHeaders = await headers()
  const userId = requestHeaders.get("x-user-id")
  
  if (!userId) {
    redirect("/auth/login")
  }

  return <AIChatInterface userId={user.id} />
}

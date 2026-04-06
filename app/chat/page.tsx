import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { AIChatInterface } from "@/components/ai-chat-interface"

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  return <AIChatInterface userId={user.id} />
}

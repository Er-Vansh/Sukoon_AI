import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  
  const requestHeaders = await headers()
  const userId = requestHeaders.get("x-user-id")
  if (!userId) {
    redirect("/auth/login")
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <header className="h-14 border-b flex items-center px-4 bg-muted/30">
        <h1 className="text-sm font-medium">Secure Video Session</h1>
        <div className="ml-auto text-xs text-muted-foreground flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           End-to-End Encrypted
        </div>
      </header>
      <div className="flex-1 bg-black">
        <iframe
          src={`https://meet.jit.si/SukoonAI-${roomId}`}
          allow="camera; microphone; fullscreen; display-capture"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CounselorVideoRoom } from "@/components/counsellor-video-room"

export default async function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  
  const requestHeaders = await headers()
  const userId = requestHeaders.get("x-user-id")
  if (!userId) {
    redirect("/auth/login")
  }

  return <CounselorVideoRoom roomId={roomId} userId={userId} />
}


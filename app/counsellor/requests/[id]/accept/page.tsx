import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/server"
import { AcceptRequestForm } from "@/components/accept-request-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AcceptRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const requestHeaders = await headers()
  const userId = requestHeaders.get("x-user-id")
  if (!userId) {
    redirect("/auth/login")
  }
  const user = { id: userId }

  // Get request details
  const { data: request } = await supabase
    .from("consultation_requests")
    .select(`
      *,
      profiles!consultation_requests_patient_id_fkey(full_name, email)
    `)
    .eq("id", id)
    .single()

  if (!request) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/counsellor/dashboard">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Accept Consultation Request</CardTitle>
            <CardDescription>Schedule an appointment with {request.profiles?.full_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
              <div>
                <span className="text-sm font-medium">Subject:</span>
                <p className="text-sm text-muted-foreground">{request.subject}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Details:</span>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>
              {request.preferred_date && (
                <div>
                  <span className="text-sm font-medium">Preferred Date:</span>
                  <p className="text-sm text-muted-foreground">{new Date(request.preferred_date).toLocaleString()}</p>
                </div>
              )}
            </div>

            <AcceptRequestForm requestId={request.id} patientId={request.patient_id} counsellorId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

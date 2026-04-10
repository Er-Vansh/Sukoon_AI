import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowLeft, User, Award, BookOpen } from "lucide-react"
import Link from "next/link"
import { BookingForm } from "@/components/booking-form"

export default async function CounsellorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get user from the proxy headers which is more reliable than cookies
  const requestHeaders = await headers()
  const userId = requestHeaders.get("x-user-id")
  
  if (!userId) {
    redirect("/auth/login")
  }

  // We can construct a minimal user object since only the id is needed for the booking form
  const user = { id: userId }

  // Get counsellor details
  const { data: counsellor } = await supabase
    .from("profiles")
    .select(`
      *,
      counsellor_profiles(*)
    `)
    .eq("id", id)
    .eq("user_type", "counsellor")
    .single()

  if (!counsellor) {
    notFound()
  }

  const { data: reviews } = await supabase
    .from("counsellor_reviews")
    .select(`*, profiles!counsellor_reviews_patient_id_fkey(full_name)`)
    .eq("counsellor_id", id)
    .order("created_at", { ascending: false })

  const counsellorProfile = counsellor.counsellor_profiles?.[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/counsellors">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Counsellors
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-32 w-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{counsellor.full_name}</h2>
                    {counsellorProfile?.specialization && (
                      <p className="text-muted-foreground mt-1">{counsellorProfile.specialization}</p>
                    )}
                  </div>
                  <Badge variant={counsellorProfile?.availability_status === "available" ? "default" : "secondary"}>
                    {counsellorProfile?.availability_status || "offline"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-semibold">{counsellorProfile?.rating?.toFixed(1) || "New"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">Sessions</span>
                  </div>
                  <span className="font-semibold">{counsellorProfile?.total_sessions || 0}</span>
                </div>

                {counsellorProfile?.years_of_experience && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <span className="font-semibold">{counsellorProfile.years_of_experience} years</span>
                  </div>
                )}

                {counsellorProfile?.license_number && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">License: {counsellorProfile.license_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Booking */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {counsellorProfile?.bio ? (
                  <p className="text-muted-foreground leading-relaxed">{counsellorProfile.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">No bio available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request a Consultation</CardTitle>
                <CardDescription>
                  Fill out the form below to request a video consultation with {counsellor.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm counsellorId={counsellor.id} patientId={user.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{review.profiles?.full_name || "Anonymous Patient"}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground break-words">{review.review_text || "No written review provided."}</p>
                        <p className="text-xs text-muted-foreground mt-2 opacity-60">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-sm">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

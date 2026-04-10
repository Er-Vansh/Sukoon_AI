import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables.")
  }

  return { url, anonKey }
}

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getPublicEnv()

  // Create a new Headers object from the incoming request so we can modify it
  const requestHeaders = new Headers(request.headers)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        // When cookies are set, we need to create a new response with the updated request headers
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    requestHeaders.set("x-user-id", user.id)
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const pathname = request.nextUrl.pathname
  const isProtectedCounsellorRoute = pathname.startsWith("/counsellor")
  const isProtectedPatientRoute = pathname.startsWith("/dashboard")

  if (!user && (isProtectedCounsellorRoute || isProtectedPatientRoute)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

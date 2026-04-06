import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables.")
  }

  return { url, anonKey }
}

export function createClient() {
  if (!browserClient) {
    const { url, anonKey } = getPublicEnv()
    browserClient = createSupabaseBrowserClient(url, anonKey)
  }

  return browserClient
}

export function createBrowserClient() {
  return createClient()
}

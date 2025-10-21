import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env"

export async function createClient() {
  const cookieStore = await cookies()

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server component - cookies already sent
        }
      },
    },
  })
}

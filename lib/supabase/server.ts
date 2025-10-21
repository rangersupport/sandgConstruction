import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseConfig } from "./config"

export async function createClient() {
  const cookieStore = await cookies()

  console.log("[v0] Creating server client with config:", {
    hasUrl: !!supabaseConfig.url,
    hasKey: !!supabaseConfig.anonKey,
  })

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error("[v0] Supabase configuration is missing. Please check environment variables.")
  }

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

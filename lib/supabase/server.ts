import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseConfig, isSupabaseConfigured } from "./config"

export async function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn("[v0] Supabase is not configured. Skipping server client creation.")
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore - called from Server Component
        }
      },
    },
  })
}

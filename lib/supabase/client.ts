import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig, isSupabaseConfigured } from "./config"

export function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn("[v0] Supabase is not configured. Skipping client creation.")
    return null
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey)
}

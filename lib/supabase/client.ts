import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig } from "./config"

export function createClient() {
  console.log("[v0] Creating browser client with config:", {
    hasUrl: !!supabaseConfig.url,
    hasKey: !!supabaseConfig.anonKey,
  })

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error("[v0] Supabase configuration is missing. Please check environment variables.")
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey)
}

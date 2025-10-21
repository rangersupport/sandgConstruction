import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[v0] Supabase URL:", SUPABASE_URL)
    console.error("[v0] Supabase Key exists:", !!SUPABASE_ANON_KEY)
    throw new Error("Missing Supabase environment variables")
  }

  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return client
}

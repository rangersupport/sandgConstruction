import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.error("[v0] Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    throw new Error("Missing Supabase environment variables")
  }

  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  return client
}

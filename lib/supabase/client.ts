import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

function getEnvVar(key: string): string {
  // Try process.env first
  if (process.env[key]) return process.env[key]!

  // Try globalThis for v0 environment
  if (typeof globalThis !== "undefined" && (globalThis as any)[key]) {
    return (globalThis as any)[key]
  }

  throw new Error(`Missing environment variable: ${key}. Please check your Supabase integration in the v0 sidebar.`)
}

export function createClient() {
  if (client) return client

  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}

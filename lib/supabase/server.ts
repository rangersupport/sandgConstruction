import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function getEnvVar(key: string): string {
  // Try process.env first
  if (process.env[key]) return process.env[key]!

  // Try globalThis for v0 environment
  if (typeof globalThis !== "undefined" && (globalThis as any)[key]) {
    return (globalThis as any)[key]
  }

  throw new Error(`Missing environment variable: ${key}`)
}

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = getEnvVar("SUPABASE_URL")
  const supabaseKey = getEnvVar("SUPABASE_ANON_KEY")

  return createServerClient(supabaseUrl, supabaseKey, {
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

// Supabase configuration
// In v0 preview, we need to access env vars this way
const getEnvVar = (key: string): string => {
  // Try multiple ways to access environment variables
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_ prefixed vars
    return (window as any)[key] || process.env[key] || ""
  }
  // Server-side: use non-prefixed vars
  return process.env[key] || process.env[`NEXT_PUBLIC_${key.replace("NEXT_PUBLIC_", "")}`] || ""
}

export const supabaseConfig = {
  url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL") || getEnvVar("SUPABASE_URL"),
  anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnvVar("SUPABASE_ANON_KEY"),
}

// Debug logging
console.log("[v0] Supabase config loaded:", {
  hasUrl: !!supabaseConfig.url,
  hasKey: !!supabaseConfig.anonKey,
  urlLength: supabaseConfig.url?.length || 0,
})

// Validate config
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.error("[v0] Missing Supabase configuration:", {
    url: supabaseConfig.url ? "present" : "missing",
    anonKey: supabaseConfig.anonKey ? "present" : "missing",
  })
}

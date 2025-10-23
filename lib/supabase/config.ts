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

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Supabase configuration with correct credentials
export const supabaseConfig = {
  // Your actual Supabase project URL from the dashboard
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ydjyovimfabtpxpgcxyj.supabase.co",
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkanlvdmltZmFidHB4cGdjeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjk2MjIsImV4cCI6MjA3NjUwNTYyMn0.AqYb0sBfglpQii3JnHVDKAW0uej6eG1CnlpyvtL2iw0",
  serviceRoleKey: serviceRoleKey,
}

// Debug logging to verify config is loaded
console.log("[v0] Supabase config loaded:", {
  url: supabaseConfig.url ? "present" : "missing",
  anonKey: supabaseConfig.anonKey ? "present" : "missing",
  serviceRoleKey: supabaseConfig.serviceRoleKey ? "present" : "missing",
})

// Validate config
if (!supabaseConfig.serviceRoleKey) {
  console.error("[v0] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing! Admin operations will fail.")
}

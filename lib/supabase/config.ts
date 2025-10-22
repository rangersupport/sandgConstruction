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

// Supabase configuration with correct credentials
export const supabaseConfig = {
  // Your actual Supabase project URL from the dashboard
  url: "https://ydjyovimfabtpxpgcxyj.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkanlvdmltZmFidHB4cGdjeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjk2MjIsImV4cCI6MjA3NjUwNTYyMn0.AqYb0sBfglpQii3JnHVDKAW0uej6eG1CnlpyvtL2iw0",
  serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
}

// Debug logging to verify config is loaded
console.log("[v0] Supabase config loaded with hardcoded credentials")

// Validate config
// if (!supabaseConfig.url || !supabaseConfig.anonKey) {
//   console.error("[v0] Missing Supabase configuration:", {
//     url: supabaseConfig.url ? "present" : "missing",
//     anonKey: supabaseConfig.anonKey ? "present" : "missing",
//   })
// }

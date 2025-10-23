// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
}

console.log("[v0] Supabase config loaded:", {
  url: supabaseConfig.url ? "✓ present" : "✗ missing",
  anonKey: supabaseConfig.anonKey ? "✓ present" : "✗ missing",
  serviceRoleKey: supabaseConfig.serviceRoleKey ? "✓ present" : "✗ missing",
})

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.error("[v0] ERROR: Supabase URL or anon key is missing!")
}

if (!supabaseConfig.serviceRoleKey) {
  console.error("[v0] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing! Admin operations will fail.")
}

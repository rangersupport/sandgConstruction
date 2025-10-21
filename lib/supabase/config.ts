export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
}

// Validate config on server side only
if (typeof window === "undefined") {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn("Supabase environment variables are not configured")
  }
}

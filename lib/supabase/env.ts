// Environment variables for Supabase
// In v0, these are injected directly and available globally
export const SUPABASE_URL =
  typeof window !== "undefined"
    ? (window as any).ENV?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

export const SUPABASE_ANON_KEY =
  typeof window !== "undefined"
    ? (window as any).ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

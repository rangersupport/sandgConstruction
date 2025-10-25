import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseConfig } from "./config"

function isValidHttpUrl(string: string): boolean {
  if (!string || string.trim() === "") return false
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!isValidHttpUrl(supabaseConfig.url) || !supabaseConfig.anonKey || supabaseConfig.anonKey.trim() === "") {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // This allows testers to access the dashboard and map without login

    // Just refresh the session if it exists, but don't enforce any redirects
    await supabase.auth.getUser()
  } catch (error) {
    console.error("[v0] Supabase middleware error:", error)
  }

  return supabaseResponse
}

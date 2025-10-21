import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseConfig } from "./config"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  console.log("[v0] Middleware running for path:", pathname)
  console.log("[v0] User authenticated:", !!user)
  console.log("[v0] User email:", user?.email || "none")

  // Public routes that don't require authentication
  const isLoginPage = pathname === "/admin/login" || pathname === "/employee/login" || pathname === "/login"
  const isRootPage = pathname === "/"
  const isPublicRoute = isLoginPage || isRootPage

  // Admin protected routes - must come before employee check
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/payroll") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/admin")

  // Employee protected routes - only /employee and /employee/* but NOT /employee/login
  const isEmployeeRoute = pathname === "/employee" || (pathname.startsWith("/employee/") && !isLoginPage)

  console.log("[v0] Is public route:", isPublicRoute)
  console.log("[v0] Is admin route:", isAdminRoute)
  console.log("[v0] Is employee route:", isEmployeeRoute)

  if (!user && (isAdminRoute || isEmployeeRoute)) {
    console.log("[v0] Redirecting to login - protected route without auth")
    const url = request.nextUrl.clone()
    url.pathname = isAdminRoute ? "/admin/login" : "/employee/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("email", user.email).single()

    console.log("[v0] User is admin:", !!adminUser)

    const url = request.nextUrl.clone()
    url.pathname = adminUser ? "/dashboard" : "/employee"
    console.log("[v0] Redirecting authenticated user to:", url.pathname)
    return NextResponse.redirect(url)
  }

  console.log("[v0] No redirect needed, continuing")
  return supabaseResponse
}

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
  const publicRoutes = ["/", "/employee/login", "/admin/login", "/login"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Admin protected routes
  const adminRoutes = ["/dashboard", "/employees", "/projects", "/payroll", "/map", "/admin"]
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Employee protected routes
  const employeeRoutes = ["/employee"]
  const isEmployeeRoute = employeeRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  console.log("[v0] Is public route:", isPublicRoute)
  console.log("[v0] Is admin route:", isAdminRoute)
  console.log("[v0] Is employee route:", isEmployeeRoute)

  // If accessing admin routes without authentication, redirect to admin login
  if (isAdminRoute && !user) {
    console.log("[v0] Redirecting to /admin/login - admin route without auth")
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // If authenticated user tries to access login pages, redirect to appropriate dashboard
  if (isPublicRoute && user && pathname !== "/") {
    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("email", user.email).single()

    console.log("[v0] User is admin:", !!adminUser)

    const url = request.nextUrl.clone()
    if (adminUser) {
      url.pathname = "/dashboard"
    } else {
      url.pathname = "/employee"
    }
    console.log("[v0] Redirecting authenticated user to:", url.pathname)
    return NextResponse.redirect(url)
  }

  console.log("[v0] No redirect needed, continuing")
  return supabaseResponse
}

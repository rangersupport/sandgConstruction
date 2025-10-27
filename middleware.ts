import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session cookies
  const adminSession = request.cookies.get("admin_session")
  const employeeSession = request.cookies.get("employee_session")

  console.log("[v0] Middleware:", {
    pathname,
    hasAdminSession: !!adminSession,
    adminSessionValue: adminSession?.value ? "present" : "missing",
    hasEmployeeSession: !!employeeSession,
  })

  // Protected admin routes
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/payroll") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/tasks")

  // Protected employee routes
  const isEmployeeRoute = pathname.startsWith("/employee") && !pathname.startsWith("/employee/login")

  // Public routes that don't need protection
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/setup") ||
    pathname.startsWith("/employee/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")

  // If trying to access admin route without admin session
  if (isAdminRoute && !adminSession) {
    console.log("[v0] Middleware: Redirecting to /admin/login - no admin session for:", pathname)
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // If trying to access employee route without employee session
  if (isEmployeeRoute && !employeeSession) {
    console.log("[v0] Middleware: Redirecting to /employee/login - no employee session for:", pathname)
    return NextResponse.redirect(new URL("/employee/login", request.url))
  }

  // If admin is logged in and trying to access login page, redirect to dashboard
  if (pathname === "/admin/login" && adminSession) {
    console.log("[v0] Middleware: Admin already logged in, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If employee is logged in and trying to access login page, redirect to employee page
  if (pathname === "/employee/login" && employeeSession) {
    console.log("[v0] Middleware: Employee already logged in, redirecting to employee page")
    return NextResponse.redirect(new URL("/employee", request.url))
  }

  console.log("[v0] Middleware: Allowing access to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

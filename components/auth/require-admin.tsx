"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      console.log("[v0] RequireAdmin: Checking authentication...")
      const supabase = createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log("[v0] RequireAdmin: User:", user?.email || "none")
      console.log("[v0] RequireAdmin: Error:", error?.message || "none")

      if (!user) {
        console.log("[v0] RequireAdmin: No user found, redirecting to /admin/login")
        router.push("/admin/login")
        return
      }

      // Check if user is an admin
      const { data: adminData } = await supabase.from("admin_users").select("*").eq("email", user.email).single()

      console.log("[v0] RequireAdmin: Admin data:", adminData ? "found" : "not found")

      if (!adminData) {
        console.log("[v0] RequireAdmin: User is not an admin, redirecting to /")
        router.push("/")
        return
      }

      console.log("[v0] RequireAdmin: User is authorized")
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

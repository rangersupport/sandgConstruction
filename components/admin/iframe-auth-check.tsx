"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function IframeAuthCheck() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if we're in an iframe and have localStorage auth
    const isInIframe = window.self !== window.top

    if (isInIframe) {
      console.log("[v0] IframeAuthCheck: Running in iframe, checking localStorage")
      const adminSession = localStorage.getItem("admin_session")

      if (adminSession) {
        try {
          const session = JSON.parse(adminSession)
          const tokenAge = Date.now() - (session.timestamp || 0)
          const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 days

          if (tokenAge < maxAge) {
            console.log("[v0] IframeAuthCheck: Valid localStorage session found")
            setChecking(false)
            return // Allow access
          } else {
            console.log("[v0] IframeAuthCheck: Session expired")
            localStorage.removeItem("admin_session")
          }
        } catch (error) {
          console.error("[v0] IframeAuthCheck: Error parsing session:", error)
          localStorage.removeItem("admin_session")
        }
      }
    }

    // No valid auth found, redirect to login
    console.log("[v0] IframeAuthCheck: No valid auth, redirecting to login")
    router.push("/admin/login")
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Checking Authentication</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adminLoginByLoginNumber } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [loginNumber, setLoginNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Admin login: Attempting login for:", loginNumber)
    console.log("[v0] Admin login: Password length:", password.length)

    try {
      const result = await adminLoginByLoginNumber(loginNumber, password)

      console.log("[v0] Admin login: Result:", { success: result.success, error: result.error })

      if (result.success) {
        console.log("[v0] Admin login: Success, redirecting to dashboard")
        router.push("/dashboard")
        router.refresh()
      } else {
        console.log("[v0] Admin login: Failed:", result.error)
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("[v0] Admin login: Exception:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">S&G</span>
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>S&G Construction Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginNumber">Login Number</Label>
                <Input
                  id="loginNumber"
                  type="text"
                  placeholder="6085"
                  required
                  value={loginNumber}
                  onChange={(e) => setLoginNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="space-y-2 pt-4 border-t">
                <Link href="/employee/login">
                  <Button variant="outline" className="w-full bg-transparent" type="button">
                    Employee Login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

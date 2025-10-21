"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createFirstAdmin } from "@/lib/actions/admin-setup-actions"

export default function AdminSetupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@sandgservice.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Admin setup: Starting account creation")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const result = await createFirstAdmin(email, password)

      if (!result.success) {
        setError(result.error || "Failed to create admin account")
        setLoading(false)
        return
      }

      console.log("[v0] Admin setup: Admin created successfully")
      setSuccess(true)

      // Redirect to login page
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Admin setup: Error:", err)
      setError(err.message || "Failed to create admin account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Create your administrator account to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              <p className="font-medium">Admin account created successfully!</p>
              <p className="text-sm mt-2">You can now log in with your credentials.</p>
              <p className="text-sm text-slate-600 mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>

              <p className="text-xs text-slate-500 text-center mt-4">
                This will create an administrator account with full access to the dashboard.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

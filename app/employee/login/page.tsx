"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { employeeLogin } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function EmployeeLoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await employeeLogin(employeeNumber, pin)

      if (result.success) {
        // Store employee session
        sessionStorage.setItem("employee_id", result.user!.id)
        sessionStorage.setItem("employee_name", result.user!.email)

        if (result.mustChangePIN) {
          router.push("/employee/change-pin")
        } else {
          router.push("/employee")
        }
        router.refresh()
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
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
            <CardTitle className="text-2xl">Employee Time Clock</CardTitle>
            <CardDescription>Enter your employee number and PIN</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeNumber">Employee Number</Label>
                <Input
                  id="employeeNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1001"
                  required
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className="text-lg h-12"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className="text-lg h-12"
                  autoComplete="off"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Clock In"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">Forgot your PIN? Contact your supervisor</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

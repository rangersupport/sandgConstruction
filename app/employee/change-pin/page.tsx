"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { changeEmployeePIN } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function ChangePINPage() {
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [newPIN, setNewPIN] = useState("")
  const [confirmPIN, setConfirmPIN] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedEmployeeId = sessionStorage.getItem("employee_id")
    const storedEmployeeName = sessionStorage.getItem("employee_name")

    if (!storedEmployeeId || !storedEmployeeName) {
      router.push("/employee/login")
      return
    }

    setEmployeeId(storedEmployeeId)
    setEmployeeName(storedEmployeeName)
  }, [router])

  const handleChangePIN = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (!employeeId) {
      setError("Session expired. Please log in again.")
      setIsLoading(false)
      return
    }

    try {
      const result = await changeEmployeePIN(employeeId, newPIN, confirmPIN)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/employee")
        }, 2000)
      } else {
        setError(result.error || "Failed to change PIN")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!employeeId) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">S&G</span>
            </div>
            <CardTitle className="text-2xl">Change Your PIN</CardTitle>
            <CardDescription>Welcome, {employeeName}! Please set a new PIN for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-center text-lg font-medium">PIN changed successfully!</p>
                <p className="text-center text-sm text-muted-foreground">Redirecting to time clock...</p>
              </div>
            ) : (
              <form onSubmit={handleChangePIN} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPIN">New PIN (4-6 digits)</Label>
                  <Input
                    id="newPIN"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••"
                    required
                    minLength={4}
                    maxLength={6}
                    value={newPIN}
                    onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    className="text-lg h-12"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPIN">Confirm New PIN</Label>
                  <Input
                    id="confirmPIN"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••"
                    required
                    minLength={4}
                    maxLength={6}
                    value={confirmPIN}
                    onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
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
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <p className="font-medium">PIN Requirements:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Must be 4-6 digits</li>
                    <li>Cannot be all same digits (1111, 2222, etc.)</li>
                    <li>Cannot be sequential (1234, 4321, etc.)</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Changing PIN...
                    </>
                  ) : (
                    "Change PIN"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

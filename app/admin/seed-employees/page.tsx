"use client"

import { useState } from "react"
import { seedRealEmployees } from "@/lib/actions/seed-employees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SeedEmployeesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await seedRealEmployees()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seed Employee Database</CardTitle>
          <CardDescription>Load 115 real employees from your PDF into the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {result.success ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <XCircle className="h-4 w-4 mt-0.5" />}
                <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
              </div>
            </Alert>
          )}

          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              "Seed Employees"
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>This will:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Delete all existing employees</li>
              <li>Insert 115 real employees from your PDF</li>
              <li>Assign employee numbers 1001-1115</li>
              <li>Set default PIN to 1234 for all employees</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

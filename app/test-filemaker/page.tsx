"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function TestFileMakerPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-filemaker")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to connect to API",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>FileMaker Connection Test</CardTitle>
          <CardDescription>Test the connection to your FileMaker server and verify data access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test FileMaker Connection"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success!" : "Connection Failed"}</AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className="mt-2 space-y-2">
                    <p className="font-semibold">{result.message}</p>
                    <div className="text-sm space-y-1">
                      <p>Employees found: {result.data?.employees?.count || 0}</p>
                      <p>Projects found: {result.data?.projects?.count || 0}</p>
                    </div>
                    {result.data?.employees?.sample && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">View sample employee data</summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(result.data.employees.sample, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="font-semibold">Error: {result.error}</p>
                    {result.details && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

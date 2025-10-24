"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

interface SyncResult {
  success: boolean
  total?: number
  inserted?: number
  updated?: number
  skipped?: number
  errors?: string[]
  error?: string
}

export function FileMakerSyncPanel() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch("/api/sync/employees", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setSyncResult({
          success: false,
          error: data.error || "Failed to sync employees",
        })
      } else {
        setSyncResult(data)
      }
    } catch (error) {
      console.error("[v0] Sync error:", error)
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <CardTitle>FileMaker Sync</CardTitle>
        </div>
        <CardDescription>Sync employees from FileMaker to Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This will fetch all employees from FileMaker and sync them to Supabase. New employees will be created, and
            existing employees will be updated with the latest data.
          </p>

          <Button onClick={handleSync} disabled={isSyncing} className="w-full sm:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Employees"}
          </Button>
        </div>

        {syncResult && (
          <div className="space-y-3">
            {syncResult.success ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Sync completed successfully!</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-muted-foreground">Total Processed</div>
                    <div className="text-2xl font-bold">{syncResult.total || 0}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-muted-foreground">Inserted</div>
                    <div className="text-2xl font-bold text-green-600">{syncResult.inserted || 0}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-muted-foreground">Updated</div>
                    <div className="text-2xl font-bold text-blue-600">{syncResult.updated || 0}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="text-muted-foreground">Skipped</div>
                    <div className="text-2xl font-bold text-gray-600">{syncResult.skipped || 0}</div>
                  </div>
                </div>

                {syncResult.errors && syncResult.errors.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Some errors occurred:</strong>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        {syncResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-xs">
                            {error}
                          </li>
                        ))}
                        {syncResult.errors.length > 5 && (
                          <li className="text-xs">...and {syncResult.errors.length - 5} more</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Sync failed:</strong> {syncResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

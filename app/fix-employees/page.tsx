"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FixEmployeesPage() {
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [currentCount, setCurrentCount] = useState<number | null>(null)

  const checkEmployees = async () => {
    setLoading(true)
    setStatus("Checking database...")

    try {
      const response = await fetch("/api/fix-employees?action=check")
      const data = await response.json()

      if (data.success) {
        setCurrentCount(data.count)
        setStatus(`Found ${data.count} employees in database`)
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const fixEmployees = async () => {
    setLoading(true)
    setStatus("Deleting old employees and inserting 115 real employees...")

    try {
      const response = await fetch("/api/fix-employees?action=fix", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setStatus(`Success! Inserted ${data.inserted} employees. Deleted ${data.deleted} old employees.`)
        setCurrentCount(data.inserted)
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Fix Employee Database</CardTitle>
          <CardDescription>Direct database fix - no SQL scripts needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkEmployees} disabled={loading}>
              Check Current Employees
            </Button>
            <Button onClick={fixEmployees} disabled={loading} variant="destructive">
              Fix Now - Insert 115 Real Employees
            </Button>
          </div>

          {currentCount !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">Current Count: {currentCount} employees</p>
            </div>
          )}

          {status && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

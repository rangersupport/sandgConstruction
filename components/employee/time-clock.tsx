"use client"

import { useState, useEffect } from "react"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import {
  clockIn,
  clockOut,
  getEmployeeStatus,
  getActiveProjects,
  getTodayHours,
} from "@/lib/actions/time-entry-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, MapPin, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import type { Project, EmployeeStatus } from "@/lib/types/database"

interface TimeClockProps {
  employeeId: string
  employeeName: string
}

export function TimeClock({ employeeId, employeeName }: TimeClockProps) {
  const { coordinates, error: gpsError, loading: gpsLoading, requestLocation } = useGeolocation()

  const [status, setStatus] = useState<EmployeeStatus | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [todayHours, setTodayHours] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<string>("0:00")
  const [showClockOutDialog, setShowClockOutDialog] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [employeeId])

  useEffect(() => {
    if (!status?.is_clocked_in || !status.clock_in) return

    const updateElapsed = () => {
      const clockInTime = new Date(status.clock_in!)
      const now = new Date()
      const diffMs = now.getTime() - clockInTime.getTime()
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      setElapsedTime(`${hours}:${minutes.toString().padStart(2, "0")}`)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000)

    return () => clearInterval(interval)
  }, [status])

  async function loadData() {
    try {
      const [statusData, projectsData, hoursData] = await Promise.all([
        getEmployeeStatus(employeeId),
        getActiveProjects(),
        getTodayHours(employeeId),
      ])

      setStatus(statusData)
      setProjects(projectsData)
      setTodayHours(hoursData)

      setMessage(null)
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage({ type: "error", text: "Failed to load data" })
    }
  }

  async function handleClockIn() {
    if (status?.is_clocked_in) {
      setShowClockOutDialog(true)
      return
    }

    if (!selectedProjectId) {
      setMessage({ type: "error", text: "Please select a project" })
      return
    }

    if (!coordinates) {
      setMessage({ type: "error", text: "Waiting for GPS location..." })
      requestLocation()
      return
    }

    setLoading(true)
    setMessage(null)

    const result = await clockIn({
      employeeId,
      projectId: selectedProjectId,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: coordinates.accuracy,
    })

    if (result.success) {
      setMessage({ type: "success", text: "Clocked in successfully!" })
      await loadData()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to clock in" })
    }

    setLoading(false)
  }

  async function handleClockOutClick() {
    if (!status?.is_clocked_in) {
      setMessage({ type: "error", text: "You are not clocked in" })
      return
    }
    setShowClockOutDialog(true)
  }

  async function confirmClockOut() {
    if (!status?.time_entry_id) {
      setMessage({ type: "error", text: "No active clock-in found" })
      setShowClockOutDialog(false)
      return
    }

    if (!coordinates) {
      setMessage({ type: "error", text: "Waiting for GPS location..." })
      requestLocation()
      setShowClockOutDialog(false)
      return
    }

    setLoading(true)
    setMessage(null)
    setShowClockOutDialog(false)

    const result = await clockOut({
      timeEntryId: status.time_entry_id,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: coordinates.accuracy,
    })

    if (result.success) {
      setMessage({ type: "success", text: "Clocked out successfully!" })
      await loadData()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to clock out" })
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {employeeName}</CardTitle>
          <CardDescription>S&G Construction Time Clock</CardDescription>
        </CardHeader>
      </Card>

      {status?.is_clocked_in && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-900 dark:text-orange-100">
            <div className="font-semibold text-lg">You Are Currently Clocked In</div>
            <div className="text-sm mt-2">
              <strong>Project:</strong> {status.project_name}
            </div>
            <div className="text-sm">
              <strong>Clock In Time:</strong> {new Date(status.clock_in!).toLocaleString()}
            </div>
            <div className="text-sm">
              <strong>Time Elapsed:</strong> {elapsedTime}
            </div>
            <div className="text-sm mt-2 font-semibold">
              Click "Clock Out" below when you're ready to end your shift.
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={status?.is_clocked_in ? "default" : "secondary"} className="text-lg px-4 py-1">
              {status?.is_clocked_in ? "Clocked In" : "Clocked Out"}
            </Badge>
          </div>

          {status?.is_clocked_in && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-semibold">{status.project_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time Elapsed:</span>
                <span className="font-mono text-2xl font-bold">{elapsedTime}</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Today's Total:</span>
            <span className="font-semibold">{todayHours.toFixed(2)} hours</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${coordinates ? "text-green-500" : "text-yellow-500"}`} />
            <div className="flex-1">
              {gpsLoading && <span className="text-muted-foreground">Getting location...</span>}
              {gpsError && <span className="text-destructive text-sm">{gpsError.message}</span>}
              {coordinates && (
                <span className="text-sm text-muted-foreground">
                  Location: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)} (±
                  {coordinates.accuracy.toFixed(0)}m)
                </span>
              )}
            </div>
            {gpsError && (
              <Button variant="outline" size="sm" onClick={requestLocation}>
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.is_clocked_in && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full h-16 text-lg font-semibold"
            variant={status?.is_clocked_in ? "destructive" : "default"}
            onClick={status?.is_clocked_in ? handleClockOutClick : handleClockIn}
            disabled={
              loading ||
              gpsLoading ||
              (!coordinates && !gpsError) ||
              (status?.is_clocked_in === false && !selectedProjectId)
            }
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {status?.is_clocked_in ? "Clock Out" : "Clock In"}
          </Button>

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : message.type === "warning" ? "default" : "default"}
              className={message.type === "warning" ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : ""}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : message.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={message.type === "warning" ? "text-orange-900 dark:text-orange-100" : ""}>
                {message.text}
                {message.type === "error" && message.text.includes("already clocked in") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-transparent"
                    onClick={handleClockOutClick}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Clock Out Now
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clock Out Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                You clocked in at <strong>{status?.clock_in ? new Date(status.clock_in).toLocaleString() : ""}</strong>
              </div>
              <div>
                You have been working for: <strong className="text-lg">{elapsedTime}</strong>
              </div>
              <div className="pt-2">Are you sure you want to clock out now?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClockOut}>Yes, Clock Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

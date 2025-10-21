"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"

const mockEmployees = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Maria Garcia" },
  { id: "4", name: "David Johnson" },
  { id: "5", name: "Sarah Williams" },
]

const mockProjects = [
  { id: "1", name: "Residential Construction" },
  { id: "2", name: "Commercial Renovation" },
  { id: "3", name: "Office Building" },
]

export function TimeClockMock() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [location, setLocation] = useState<string>("Location captured")
  const [todayEntries, setTodayEntries] = useState<any[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - clockInTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isClockedIn, clockInTime])

  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleClockIn = () => {
    const now = new Date()
    setClockInTime(now)
    setIsClockedIn(true)
    setElapsedSeconds(0)
    console.log("[v0] Clocked in at", now.toISOString())
  }

  const handleClockOut = () => {
    if (clockInTime) {
      const hours = elapsedSeconds / 3600
      const entry = {
        id: Date.now().toString(),
        employee: mockEmployees.find((e) => e.id === selectedEmployee)?.name,
        project: mockProjects.find((p) => p.id === selectedProject)?.name,
        clockIn: clockInTime.toLocaleTimeString(),
        clockOut: new Date().toLocaleTimeString(),
        hours: hours.toFixed(2),
      }
      setTodayEntries([entry, ...todayEntries])
      setIsClockedIn(false)
      setClockInTime(null)
      setElapsedSeconds(0)
      console.log("[v0] Clocked out, entry:", entry)
    }
  }

  const canClockIn = selectedEmployee && selectedProject && !isClockedIn
  const canClockOut = isClockedIn

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Employee Time Clock</h1>
        <p className="text-muted-foreground">Clock in and out of your shifts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isClockedIn}>
              <SelectTrigger>
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isClockedIn}>
              <SelectTrigger>
                <SelectValue placeholder="Choose project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isClockedIn && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Elapsed Time:</span>
                <span className="text-2xl font-mono font-bold">{formatElapsedTime(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleClockIn} disabled={!canClockIn} className="flex-1" size="lg">
              Clock In
            </Button>
            <Button onClick={handleClockOut} disabled={!canClockOut} variant="destructive" className="flex-1" size="lg">
              Clock Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {todayEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {todayEntries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{entry.project}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.clockIn} - {entry.clockOut}
                    </div>
                  </div>
                  <Badge>{entry.hours}h</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

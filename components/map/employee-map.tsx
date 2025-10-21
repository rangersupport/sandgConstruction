"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock } from "lucide-react"

interface ActiveEmployee {
  id: string
  name: string
  project_name: string
  latitude: number
  longitude: number
  clock_in: string
  hours_elapsed: number
}

export function EmployeeMap() {
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveEmployees()
    const interval = setInterval(loadActiveEmployees, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadActiveEmployees() {
    try {
      const response = await fetch("/api/active-employees")
      const data = await response.json()
      setActiveEmployees(data)
    } catch (error) {
      console.error("Error loading active employees:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate center point of all active employees
  const centerLat =
    activeEmployees.length > 0
      ? activeEmployees.reduce((sum, emp) => sum + emp.latitude, 0) / activeEmployees.length
      : 26.0 // Default to Florida

  const centerLng =
    activeEmployees.length > 0
      ? activeEmployees.reduce((sum, emp) => sum + emp.longitude, 0) / activeEmployees.length
      : -80.2

  return (
    <div className="h-full w-full flex flex-col lg:flex-row">
      {/* Map Container */}
      <div className="flex-1 relative bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.1},${centerLat - 0.1},${centerLng + 0.1},${centerLat + 0.1}&layer=mapnik&marker=${centerLat},${centerLng}`}
            className="w-full h-full border-0"
            title="Employee Location Map"
          />
        </div>

        {/* Overlay with employee markers */}
        <div className="absolute top-4 left-4 right-4 pointer-events-none">
          <Card className="pointer-events-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Active Employees: {activeEmployees.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Sidebar with employee list */}
      <div className="w-full lg:w-96 bg-background border-l overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Active Workers</h2>
            <p className="text-sm text-muted-foreground">Real-time employee locations</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : activeEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active employees</div>
          ) : (
            <div className="space-y-3">
              {activeEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.project_name}</p>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {employee.hours_elapsed.toFixed(1)}h
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {employee.latitude.toFixed(4)}, {employee.longitude.toFixed(4)}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Clocked in: {new Date(employee.clock_in).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

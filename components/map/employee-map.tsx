"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock } from "lucide-react"

const MapView = dynamic(() => import("./map-view"), { ssr: false })

interface ActiveEmployee {
  id: string
  name: string
  project_name: string
  latitude: number | null
  longitude: number | null
  clock_in: string
  hours_elapsed: number
}

export function EmployeeMap() {
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  useEffect(() => {
    loadActiveEmployees()
    const interval = setInterval(loadActiveEmployees, 30000)
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

  const centerLat =
    activeEmployees.length > 0 && activeEmployees.some((emp) => emp.latitude != null && emp.longitude != null)
      ? activeEmployees.filter((emp) => emp.latitude != null).reduce((sum, emp) => sum + emp.latitude, 0) /
        activeEmployees.filter((emp) => emp.latitude != null).length
      : 26.7153

  const centerLng =
    activeEmployees.length > 0 && activeEmployees.some((emp) => emp.latitude != null && emp.longitude != null)
      ? activeEmployees.filter((emp) => emp.longitude != null).reduce((sum, emp) => sum + emp.longitude, 0) /
        activeEmployees.filter((emp) => emp.longitude != null).length
      : -80.0534

  const validEmployees = activeEmployees.filter((emp) => emp.latitude != null && emp.longitude != null)

  return (
    <div className="h-full w-full flex flex-col lg:flex-row">
      <div className="flex-1 relative">
        <MapView
          employees={validEmployees}
          center={[centerLat, centerLng]}
          onMarkerClick={(id) => setSelectedEmployee(id)}
          selectedEmployee={selectedEmployee}
        />

        {/* Overlay card */}
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <Card className="pointer-events-auto shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Active Employees: {validEmployees.length}
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
          ) : validEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active employees with location data</div>
          ) : (
            <div className="space-y-3">
              {validEmployees.map((employee) => (
                <Card
                  key={employee.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedEmployee === employee.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                >
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
                        {employee.latitude?.toFixed(4)}, {employee.longitude?.toFixed(4)}
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

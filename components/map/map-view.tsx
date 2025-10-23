"use client"

import { useEffect, useState } from "react"

interface Employee {
  id: string
  name: string
  project_name: string
  latitude: number
  longitude: number
  clock_in: string
  hours_elapsed: number
}

interface MapViewProps {
  employees: Employee[]
  center: [number, number]
  onMarkerClick: (id: string) => void
  selectedEmployee: string | null
}

export default function MapView({ employees, center, onMarkerClick, selectedEmployee }: MapViewProps) {
  const [mapUrl, setMapUrl] = useState("")
  const [mapboxToken, setMapboxToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/mapbox-token")
        if (!response.ok) {
          throw new Error("Failed to fetch Mapbox token")
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setMapboxToken(data.token)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error)
        setError("Map unavailable - Mapbox token not configured")
      } finally {
        setIsLoading(false)
      }
    }
    fetchToken()
  }, [])

  useEffect(() => {
    if (!mapboxToken) return

    if (employees.length === 0) {
      setMapUrl(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${center[1]},${center[0]},10,0/800x600@2x?access_token=${mapboxToken}`,
      )
      return
    }

    const centerLat = employees.reduce((sum, emp) => sum + emp.latitude, 0) / employees.length
    const centerLng = employees.reduce((sum, emp) => sum + emp.longitude, 0) / employees.length

    const markers = employees
      .map((emp) => `pin-s-${emp.name.charAt(0).toLowerCase()}+22c55e(${emp.longitude},${emp.latitude})`)
      .join(",")

    const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/${centerLng},${centerLat},10,0/800x600@2x?access_token=${mapboxToken}`

    setMapUrl(url)
  }, [employees, center, mapboxToken])

  if (error) {
    return (
      <div className="w-full h-full relative bg-gray-100">
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Map Unavailable</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full relative bg-gray-100">
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Loading Map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-gray-100">
      {employees.length > 0 ? (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 relative">
            <img
              src={mapUrl || "/placeholder.svg"}
              alt="Employee locations map"
              className="w-full h-full object-cover"
            />

            {employees.map((employee, index) => {
              const position = {
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`,
              }

              return (
                <button
                  key={employee.id}
                  onClick={() => onMarkerClick(employee.id)}
                  className={`absolute w-12 h-12 rounded-full bg-green-500 border-4 border-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-white font-bold ${
                    selectedEmployee === employee.id ? "ring-4 ring-blue-500 scale-125" : ""
                  }`}
                  style={position}
                  title={`${employee.name} - ${employee.project_name}`}
                >
                  👷
                </button>
              )
            })}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex flex-wrap gap-4 text-sm">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => onMarkerClick(employee.id)}
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-gray-500">- {employee.project_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No Active Employees</p>
            <p className="text-sm">Employee locations will appear here when they clock in</p>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActiveLocation {
  id: string
  employee_id: string
  employee_name: string
  project_id: string
  project_name: string
  clock_in: string
  latitude: number
  longitude: number
  location: string
}

interface GroupedLocation {
  latitude: number
  longitude: number
  employees: ActiveLocation[]
  project_name: string
}

export function ActiveEmployeesMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [locations, setLocations] = useState<ActiveLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [mapboxToken, setMapboxToken] = useState<string>("")

  async function fetchLocations() {
    try {
      const response = await fetch("/api/active-locations")
      if (!response.ok) throw new Error("Failed to fetch locations")
      const data = await response.json()
      setLocations(data)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load locations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      setError("Mapbox token not configured")
      setLoading(false)
      return
    }

    mapboxgl.accessToken = token

    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-82.4572, 27.9506], // Florida center
      zoom: 8,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    fetchLocations()

    const interval = setInterval(fetchLocations, 30000)

    return () => {
      clearInterval(interval)
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!map.current || loading) return

    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    if (locations.length === 0) return

    const groupedLocations: GroupedLocation[] = []
    const LOCATION_THRESHOLD = 0.0005 // ~50 meters

    locations.forEach((location) => {
      const existingGroup = groupedLocations.find(
        (group) =>
          Math.abs(group.latitude - location.latitude) < LOCATION_THRESHOLD &&
          Math.abs(group.longitude - location.longitude) < LOCATION_THRESHOLD,
      )

      if (existingGroup) {
        existingGroup.employees.push(location)
      } else {
        groupedLocations.push({
          latitude: location.latitude,
          longitude: location.longitude,
          employees: [location],
          project_name: location.project_name,
        })
      }
    })

    const bounds = new mapboxgl.LngLatBounds()

    groupedLocations.forEach((group) => {
      const employeeCount = group.employees.length

      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.position = "relative"
      el.style.width = "40px"
      el.style.height = "40px"
      el.style.cursor = "pointer"

      // Main marker circle
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${
          employeeCount > 1
            ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            background-color: #ef4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${employeeCount}
          </div>
        `
            : ""
        }
      `

      const employeesList = group.employees
        .map((emp) => {
          const clockInTime = new Date(emp.clock_in)
          const hoursElapsed = ((Date.now() - clockInTime.getTime()) / 3600000).toFixed(1)
          return `
            <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${emp.employee_name}</div>
              <div style="font-size: 13px; color: #666;">
                Clocked in: ${clockInTime.toLocaleTimeString()} (${hoursElapsed}h)
              </div>
            </div>
          `
        })
        .join("")

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 220px; max-width: 300px;">
          <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
            ${group.project_name}
          </h3>
          <div style="font-size: 13px; color: #3b82f6; margin-bottom: 12px; font-weight: 600;">
            ${employeeCount} ${employeeCount === 1 ? "Employee" : "Employees"} on site
          </div>
          <div style="max-height: 300px; overflow-y: auto;">
            ${employeesList}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            ${group.employees[0].location}
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([group.longitude, group.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      markers.current.push(marker)
      bounds.extend([group.longitude, group.latitude])
    })

    if (groupedLocations.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      })
    }
  }, [locations, loading])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Active Employees Map
            </CardTitle>
            <CardDescription>
              Real-time locations of clocked-in employees
              {locations.length > 0 && ` • ${locations.length} active`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Updated {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchLocations} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {!loading && locations.length === 0 && (
          <div className="bg-muted p-8 rounded-md text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No employees currently clocked in</p>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-[600px] rounded-md overflow-hidden" />
      </CardContent>
    </Card>
  )
}

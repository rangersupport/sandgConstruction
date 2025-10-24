"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Building2 } from "lucide-react"

interface Worker {
  id: string
  name: string
  hours: number | null
}

interface ProjectLocation {
  project_id: string
  project_name: string
  latitude: number | null
  longitude: number | null
  address: string
  active_workers: number
  workers: Worker[]
}

export function ProjectMapMapbox() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [projects, setProjects] = useState<ProjectLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return

    const link = document.createElement("link")
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"
    script.async = true
    script.onload = () => {
      console.log("[v0] Mapbox GL JS loaded successfully")
      setMapboxLoaded(true)
    }
    script.onerror = () => {
      console.error("[v0] Failed to load Mapbox GL JS")
      setError("Failed to load map library")
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch("/api/mapbox-token")
        const data = await response.json()
        setMapboxToken(data.token)
      } catch (error) {
        console.error("[v0] Failed to fetch Mapbox token:", error)
        setError("Failed to load map configuration")
      }
    }
    fetchToken()
  }, [])

  useEffect(() => {
    loadProjectLocations()
    const interval = setInterval(loadProjectLocations, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || map.current || projects.length === 0 || !mapboxToken) return

    const mapboxgl = (window as any).mapboxgl
    if (!mapboxgl) {
      console.error("[v0] Mapbox GL not available")
      setError("Map library not loaded")
      return
    }

    mapboxgl.accessToken = mapboxToken
    console.log("[v0] Mapbox token set, initializing map...")

    const validProjects = projects.filter(
      (p) => p.latitude != null && p.longitude != null && p.latitude !== 0 && p.longitude !== 0,
    )

    if (validProjects.length === 0) {
      console.log("[v0] No projects with valid coordinates")
      setError("No projects with location data available")
      return
    }

    try {
      const centerLat = validProjects.reduce((sum, p) => sum + p.latitude!, 0) / validProjects.length
      const centerLng = validProjects.reduce((sum, p) => sum + p.longitude!, 0) / validProjects.length

      console.log("[v0] Creating map centered at:", centerLat, centerLng)

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [centerLng, centerLat],
        zoom: 9,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      validProjects.forEach((project) => {
        const el = document.createElement("div")
        el.className = "project-marker"
        el.style.cssText = `
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #22c55e;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        `
        el.textContent = project.active_workers.toString()
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.1)"
        })
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)"
        })
        el.addEventListener("click", () => {
          setSelectedProject(project.project_id)
        })

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${project.project_name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${project.address}</p>
            <div style="font-size: 12px;">
              ${project.workers
                .map(
                  (w) =>
                    `<div style="display: flex; justify-between; margin-bottom: 4px;"><span>${w.name}</span><span style="color: #666;">${(w.hours || 0).toFixed(1)}h</span></div>`,
                )
                .join("")}
            </div>
          </div>
        `)

        new mapboxgl.Marker(el).setLngLat([project.longitude!, project.latitude!]).setPopup(popup).addTo(map.current)
      })

      const bounds = new mapboxgl.LngLatBounds()
      validProjects.forEach((p) => bounds.extend([p.longitude!, p.latitude!]))
      map.current.fitBounds(bounds, { padding: 50 })

      console.log("[v0] Map initialized successfully with", validProjects.length, "markers")
    } catch (err) {
      console.error("[v0] Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [mapboxLoaded, projects, mapboxToken])

  async function loadProjectLocations() {
    try {
      console.log("[v0] Loading project locations...")
      const response = await fetch("/api/project-locations")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Loaded", data.length, "projects")
      setProjects(data)
      setError(null)
    } catch (error) {
      console.error("[v0] Error loading project locations:", error)
      setError("Failed to load project data")
    } finally {
      setLoading(false)
    }
  }

  const totalWorkers = projects.reduce((sum, p) => sum + p.active_workers, 0)
  const validProjects = projects.filter(
    (p) => p.latitude != null && p.longitude != null && p.latitude !== 0 && p.longitude !== 0,
  )
  const invalidProjects = projects.filter(
    (p) => p.latitude == null || p.longitude == null || p.latitude === 0 || p.longitude === 0,
  )

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 p-4">
      <div className="flex-1 relative rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="w-full h-full min-h-[500px]" />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <p className="text-destructive font-semibold mb-2">Map Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">Check browser console for details</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Active Projects: {validProjects.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Total Workers: {totalWorkers}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              #
            </div>
            <span className="text-muted-foreground">Active Workers at Site</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div>
          <h2 className="text-2xl font-bold mb-2">Project Sites</h2>
          <p className="text-sm text-muted-foreground">Click on a marker to see details</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : validProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {invalidProjects.length > 0 ? (
              <div className="space-y-2">
                <p>No projects with valid location data</p>
                <p className="text-xs">
                  {invalidProjects.length} project(s) have invalid GPS coordinates. Employees need to enable location
                  services when clocking in.
                </p>
              </div>
            ) : (
              "No active projects"
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {validProjects.map((project) => (
              <Card
                key={project.project_id}
                className={`hover:shadow-md transition-all cursor-pointer ${
                  selectedProject === project.project_id ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                onClick={() => setSelectedProject(project.project_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{project.project_name}</h3>
                      <p className="text-sm text-muted-foreground flex items-start gap-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {project.address}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-500 text-white ml-2">
                      <Users className="w-3 h-3 mr-1" />
                      {project.active_workers}
                    </Badge>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Active Workers</p>
                    {project.workers.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between text-sm bg-muted/50 rounded p-2"
                      >
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(worker.hours || 0).toFixed(1)}h
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    GPS: {project.latitude!.toFixed(4)}, {project.longitude!.toFixed(4)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {invalidProjects.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Location Data Missing</p>
                  <p className="text-xs text-yellow-700">
                    {invalidProjects.length} project(s) have workers without valid GPS coordinates. Make sure employees
                    enable location services when clocking in.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

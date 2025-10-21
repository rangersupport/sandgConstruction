"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Building2 } from "lucide-react"

interface Worker {
  id: string
  name: string
  hours: number
}

interface ProjectLocation {
  project_id: string
  project_name: string
  latitude: number
  longitude: number
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

  // Load Mapbox GL JS
  useEffect(() => {
    if (typeof window === "undefined") return

    // Load Mapbox CSS
    const link = document.createElement("link")
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    // Load Mapbox JS
    const script = document.createElement("script")
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"
    script.async = true
    script.onload = () => setMapboxLoaded(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  // Load project data
  useEffect(() => {
    loadProjectLocations()
    const interval = setInterval(loadProjectLocations, 30000)
    return () => clearInterval(interval)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || map.current || projects.length === 0) return

    const mapboxgl = (window as any).mapboxgl
    if (!mapboxgl) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

    // Calculate center from projects
    const centerLat = projects.reduce((sum, p) => sum + p.latitude, 0) / projects.length
    const centerLng = projects.reduce((sum, p) => sum + p.longitude, 0) / projects.length

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: 9,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add markers for each project
    projects.forEach((project) => {
      // Create custom marker element
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

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${project.project_name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${project.address}</p>
          <div style="font-size: 12px;">
            ${project.workers.map((w) => `<div style="display: flex; justify-between; margin-bottom: 4px;"><span>${w.name}</span><span style="color: #666;">${w.hours.toFixed(1)}h</span></div>`).join("")}
          </div>
        </div>
      `)

      // Add marker to map
      new mapboxgl.Marker(el).setLngLat([project.longitude, project.latitude]).setPopup(popup).addTo(map.current)
    })

    // Fit bounds to show all markers
    const bounds = new mapboxgl.LngLatBounds()
    projects.forEach((p) => bounds.extend([p.longitude, p.latitude]))
    map.current.fitBounds(bounds, { padding: 50 })
  }, [mapboxLoaded, projects])

  async function loadProjectLocations() {
    try {
      const response = await fetch("/api/project-locations")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error loading project locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalWorkers = projects.reduce((sum, p) => sum + p.active_workers, 0)

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Map Container */}
      <div className="flex-1 relative rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="w-full h-full min-h-[500px]" />

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Active Projects: {projects.length}
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

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              #
            </div>
            <span className="text-muted-foreground">Active Workers at Site</span>
          </div>
        </div>
      </div>

      {/* Project List Sidebar */}
      <div className="w-full lg:w-96 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div>
          <h2 className="text-2xl font-bold mb-2">Project Sites</h2>
          <p className="text-sm text-muted-foreground">Click on a marker to see details</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active projects</div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
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

                  {/* Worker List */}
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
                          {worker.hours.toFixed(1)}h
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    GPS: {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

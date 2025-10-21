"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Building2 } from "lucide-react"
import { google } from "google-maps"

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

export function ProjectMap() {
  const [projects, setProjects] = useState<ProjectLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  useEffect(() => {
    loadProjectLocations()
    const interval = setInterval(loadProjectLocations, 30000)
    return () => clearInterval(interval)
  }, [])

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

  // Calculate map bounds
  const centerLat = projects.length > 0 ? projects.reduce((sum, p) => sum + p.latitude, 0) / projects.length : 26.5
  const centerLng = projects.length > 0 ? projects.reduce((sum, p) => sum + p.longitude, 0) / projects.length : -80.1

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Interactive Map */}
      <div className="flex-1 relative rounded-lg overflow-hidden border bg-muted">
        <InteractiveProjectMap
          projects={projects}
          center={[centerLat, centerLng]}
          selectedProject={selectedProject}
          onProjectClick={setSelectedProject}
        />

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
      </div>

      {/* Project List Sidebar */}
      <div className="w-full lg:w-96 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div>
          <h2 className="text-2xl font-bold mb-2">Project Sites</h2>
          <p className="text-sm text-muted-foreground">Click on a project to see details</p>
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

function InteractiveProjectMap({
  projects,
  center,
  selectedProject,
  onProjectClick,
}: {
  projects: ProjectLocation[]
  center: [number, number]
  selectedProject: string | null
  onProjectClick: (id: string) => void
}) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || projects.length === 0) return

    const mapElement = document.getElementById("project-map")
    if (!mapElement) return

    const map = new google.maps.Map(mapElement, {
      center: { lat: center[0], lng: center[1] },
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })

    const bounds = new google.maps.LatLngBounds()

    // Add markers for each project
    projects.forEach((project) => {
      const position = { lat: project.latitude, lng: project.longitude }
      bounds.extend(position)

      // Create custom marker with worker count
      const marker = new google.maps.Marker({
        position,
        map,
        title: project.project_name,
        label: {
          text: project.active_workers.toString(),
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: selectedProject === project.project_id ? "#3b82f6" : "#22c55e",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
        },
      })

      // Info window with project details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${project.project_name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${project.address}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                ${project.active_workers} Active Workers
              </span>
            </div>
            <div style="font-size: 12px; color: #666;">
              ${project.workers.map((w) => `<div>• ${w.name} (${w.hours.toFixed(1)}h)</div>`).join("")}
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        onProjectClick(project.project_id)
        infoWindow.open(map, marker)
      })

      // Open info window for selected project
      if (selectedProject === project.project_id) {
        infoWindow.open(map, marker)
      }
    })

    // Fit map to show all markers
    if (projects.length > 1) {
      map.fitBounds(bounds)
    }
  }, [mapLoaded, projects, center, selectedProject, onProjectClick])

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <div id="project-map" className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  )
}

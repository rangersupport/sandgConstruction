"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Building2, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [zoom, setZoom] = useState(10)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number) => {
    const scale = Math.pow(2, zoom)
    const worldWidth = 256 * scale
    const worldHeight = 256 * scale

    const x = ((lng + 180) / 360) * worldWidth
    const latRad = (lat * Math.PI) / 180
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
    const y = worldHeight / 2 - (worldWidth * mercN) / (2 * Math.PI)

    return { x: x + pan.x, y: y + pan.y }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full h-full min-h-[500px] relative bg-slate-100">
      {/* Map Background with OpenStreetMap tiles */}
      <div
        className="absolute inset-0 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${Math.floor(((center[1] + 180) / 360) * Math.pow(2, zoom))}/${Math.floor(((1 - Math.log(Math.tan((center[0] * Math.PI) / 180) + 1 / Math.cos((center[0] * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))}.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Project Markers */}
        {projects.map((project) => {
          const pos = latLngToPixel(project.latitude, project.longitude)
          const isSelected = selectedProject === project.project_id

          return (
            <div
              key={project.project_id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
              style={{
                left: `${(pos.x / 256) * 100}%`,
                top: `${(pos.y / 256) * 100}%`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onProjectClick(project.project_id)
              }}
            >
              {/* Marker Circle with Worker Count */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all ${
                  isSelected ? "bg-blue-500 ring-4 ring-blue-300 scale-125" : "bg-green-500 ring-2 ring-white"
                }`}
              >
                <span className="text-white font-bold text-lg">{project.active_workers}</span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
                <h4 className="font-bold text-sm mb-1">{project.project_name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{project.address}</p>
                <div className="text-xs space-y-1">
                  {project.workers.map((w) => (
                    <div key={w.id} className="flex justify-between">
                      <span>{w.name}</span>
                      <span className="text-muted-foreground">{w.hours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.min(z + 1, 18))}
          className="shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.max(z - 1, 3))}
          className="shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
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
  )
}

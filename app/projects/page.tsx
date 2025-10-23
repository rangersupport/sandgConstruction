"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { NewProjectDialog } from "@/components/projects/new-project-dialog"
import { getAllProjects } from "@/lib/actions/project-actions"

interface ProjectWithWorkers {
  id: string
  name: string
  status: string
  location: string
  latitude?: number
  longitude?: number
  active_workers: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithWorkers[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
    // Refresh every 30 seconds to show real-time worker counts
    const interval = setInterval(loadProjects, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadProjects() {
    try {
      const dbProjects = await getAllProjects()

      const uniqueProjects = Array.from(new Map(dbProjects.map((p) => [p.id, p])).values())

      const response = await fetch("/api/project-locations")
      const activeProjects = await response.json()

      // Create a map of project IDs to active worker counts
      const workerCountMap = new Map(activeProjects.map((p: any) => [p.project_id, p.active_workers]))

      const projectsWithWorkers: ProjectWithWorkers[] = uniqueProjects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status || "active",
        location: p.location,
        latitude: p.latitude,
        longitude: p.longitude,
        active_workers: workerCountMap.get(p.id) || 0,
      }))

      setProjects(projectsWithWorkers)
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const activeProjectsCount = projects.filter((p) => p.status === "active").length
  const totalActiveWorkers = projects.reduce((sum, p) => sum + p.active_workers, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Active and upcoming construction projects</p>
        </div>
        <div className="flex gap-2">
          <NewProjectDialog />
          <Link href="/map">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent flex items-center gap-2 px-4 py-2">
              <MapPin className="w-4 h-4" />
              View on Map
              <ExternalLink className="w-3 h-3" />
            </Badge>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalActiveWorkers}</div>
            <p className="text-xs text-muted-foreground">Workers Clocked In</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.active_workers > 0 && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {project.active_workers}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                {project.location && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <p className="text-sm flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      {project.location}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Active Workers:
                    </span>
                    <span className="font-semibold text-green-600">
                      {project.active_workers > 0 ? project.active_workers : "None"}
                    </span>
                  </div>
                </div>
                {project.latitude && project.longitude && (
                  <Link href="/map" className="block">
                    <div className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3" />
                      View on map
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

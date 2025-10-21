import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockProjects = [
  { id: 1, name: "Residential Construction", status: "active", location: "123 Main St, Miami, FL" },
  { id: 2, name: "Commercial Renovation", status: "active", location: "456 Business Blvd, Tampa, FL" },
  { id: 3, name: "Office Building", status: "planning", location: "789 Corporate Dr, Orlando, FL" },
]

export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Active and upcoming construction projects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  <p className="text-sm">{project.location}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase.from("projects").select("*").order("name", { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Active and upcoming construction projects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(projects || []).map((project) => (
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
